package com.educycle.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Tag("integration")
class UsernameNormalizeMigrationTest {

    @Test
    @DisplayName("V4 normalizes usernames without violating runtime policy or unique constraint")
    void v4NormalizesUsernamesSafely() throws Exception {
        try (PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("educycle")
                .withUsername("educycle")
                .withPassword("secret")) {
            postgres.start();

            Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .locations("classpath:db/migration")
                    .target("3")
                    .load()
                    .migrate();

            UUID longA = UUID.fromString("10000000-0000-0000-0000-000000000001");
            UUID longB = UUID.fromString("10000000-0000-0000-0000-000000000002");
            UUID shortId = UUID.fromString("10000000-0000-0000-0000-000000000003");
            UUID stableId = UUID.fromString("10000000-0000-0000-0000-000000000004");
            String common50 = "studentname_" + "a".repeat(37) + "z";

            try (var connection = DriverManager.getConnection(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
                insertUser(connection, longA, "  " + common50 + "X  ", "long-a@student.edu.vn", 1);
                insertUser(connection, longB, common50 + "Y", "long-b@student.edu.vn", 2);
                insertUser(connection, shortId, " a ", "short@student.edu.vn", 3);
                insertUser(connection, stableId, "stableuser", "stable@student.edu.vn", 4);
            }

            Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .locations("classpath:db/migration")
                    .load()
                    .migrate();

            try (var connection = DriverManager.getConnection(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
                String longAUsername = username(connection, longA);
                String longBUsername = username(connection, longB);
                String shortUsername = username(connection, shortId);
                String stableUsername = username(connection, stableId);

                assertUsernamePolicy(List.of(longAUsername, longBUsername, shortUsername, stableUsername));
                assertThat(longAUsername).isNotEqualTo(longBUsername);
                assertThat(shortUsername).startsWith("user_");
                assertThat(stableUsername).isEqualTo("stableuser");
                assertThat(countDuplicateUsernames(connection)).isZero();
                assertThat(hasConstraint(connection, "uq_users_username")).isTrue();

                assertThatThrownBy(() -> insertUser(
                        connection,
                        UUID.fromString("10000000-0000-0000-0000-000000000005"),
                        "stableuser",
                        "duplicate@student.edu.vn",
                        5))
                        .isInstanceOf(SQLException.class);
            }
        }
    }

    @Test
    @DisplayName("V5 deduplicates legacy reviews, removes orphan transaction refs, then adds constraints")
    void v5CleansLegacyReviewsBeforeAddingConstraints() throws Exception {
        try (PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("educycle")
                .withUsername("educycle")
                .withPassword("secret")) {
            postgres.start();

            Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .locations("classpath:db/migration")
                    .target("4")
                    .load()
                    .migrate();

            UUID buyerId = UUID.fromString("20000000-0000-0000-0000-000000000001");
            UUID sellerId = UUID.fromString("20000000-0000-0000-0000-000000000002");
            UUID productId = UUID.fromString("20000000-0000-0000-0000-000000000003");
            UUID transactionId = UUID.fromString("20000000-0000-0000-0000-000000000004");
            UUID orphanTransactionId = UUID.fromString("20000000-0000-0000-0000-000000000099");

            try (var connection = DriverManager.getConnection(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
                insertUser(connection, buyerId, "buyer_v5", "buyer-v5@student.edu.vn", 1);
                insertUser(connection, sellerId, "seller_v5", "seller-v5@student.edu.vn", 2);
                insertProduct(connection, productId, sellerId);
                insertTransaction(connection, transactionId, productId, buyerId, sellerId);
                insertReview(connection, buyerId, sellerId, productId, transactionId, 3);
                insertReview(connection, buyerId, sellerId, productId, transactionId, 4);
                insertReview(connection, buyerId, sellerId, productId, orphanTransactionId, 5);
            }

            Flyway.configure()
                    .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                    .locations("classpath:db/migration")
                    .load()
                    .migrate();

            try (var connection = DriverManager.getConnection(
                    postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
                assertThat(countReviewsForTransaction(connection, transactionId)).isEqualTo(1);
                assertThat(countReviewsForTransaction(connection, orphanTransactionId)).isZero();
                assertThat(hasConstraint(connection, "uq_reviews_transaction_reviewer_target")).isTrue();
                assertThat(hasConstraint(connection, "fk_reviews_transaction")).isTrue();
                assertThat(hasIndex(connection, "idx_transactions_status_disputed_at")).isTrue();

                assertThatThrownBy(() -> insertReview(connection, buyerId, sellerId, productId, transactionId, 5))
                        .isInstanceOf(SQLException.class);
                assertThatThrownBy(() -> insertReview(
                        connection,
                        buyerId,
                        sellerId,
                        productId,
                        UUID.fromString("20000000-0000-0000-0000-000000000098"),
                        5))
                        .isInstanceOf(SQLException.class);
            }
        }
    }

    private static void insertUser(
            java.sql.Connection connection,
            UUID id,
            String username,
            String email,
            int minutesOffset) throws SQLException {
        try (var statement = connection.prepareStatement("""
                INSERT INTO users (id, username, email, password_hash, role, created_at)
                VALUES (?, ?, ?, 'hash', 'USER', ?)
                """)) {
            statement.setObject(1, id);
            statement.setString(2, username);
            statement.setString(3, email);
            statement.setObject(4, OffsetDateTime.parse("2026-01-01T00:00:00Z").plusMinutes(minutesOffset));
            statement.executeUpdate();
        }
    }

    private static void insertProduct(
            java.sql.Connection connection,
            UUID id,
            UUID sellerId) throws SQLException {
        try (var statement = connection.prepareStatement("""
                INSERT INTO products (id, name, price, user_id, status, created_at)
                VALUES (?, 'Book', 10.00, ?, 'APPROVED', '2026-01-01T00:00:00Z')
                """)) {
            statement.setObject(1, id);
            statement.setObject(2, sellerId);
            statement.executeUpdate();
        }
    }

    private static void insertTransaction(
            java.sql.Connection connection,
            UUID id,
            UUID productId,
            UUID buyerId,
            UUID sellerId) throws SQLException {
        try (var statement = connection.prepareStatement("""
                INSERT INTO transactions (id, product_id, buyer_id, seller_id, amount, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 10.00, 'COMPLETED', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
                """)) {
            statement.setObject(1, id);
            statement.setObject(2, productId);
            statement.setObject(3, buyerId);
            statement.setObject(4, sellerId);
            statement.executeUpdate();
        }
    }

    private static void insertReview(
            java.sql.Connection connection,
            UUID reviewerId,
            UUID targetUserId,
            UUID productId,
            UUID transactionId,
            int minuteOffset) throws SQLException {
        try (var statement = connection.prepareStatement("""
                INSERT INTO reviews (user_id, target_user_id, product_id, transaction_id, rating, content, created_at)
                VALUES (?, ?, ?, ?, 5, 'legacy review', ?)
                """)) {
            statement.setObject(1, reviewerId);
            statement.setObject(2, targetUserId);
            statement.setObject(3, productId);
            statement.setObject(4, transactionId);
            statement.setObject(5, OffsetDateTime.parse("2026-01-01T00:00:00Z").plusMinutes(minuteOffset));
            statement.executeUpdate();
        }
    }

    private static String username(java.sql.Connection connection, UUID id) throws SQLException {
        try (var statement = connection.prepareStatement("SELECT username FROM users WHERE id = ?")) {
            statement.setObject(1, id);
            try (var rs = statement.executeQuery()) {
                assertThat(rs.next()).isTrue();
                return rs.getString(1);
            }
        }
    }

    private static long countDuplicateUsernames(java.sql.Connection connection) throws SQLException {
        try (var statement = connection.createStatement();
             var rs = statement.executeQuery("""
                     SELECT COUNT(*)
                     FROM (
                         SELECT username
                         FROM users
                         GROUP BY username
                         HAVING COUNT(*) > 1
                     ) duplicates
                     """)) {
            assertThat(rs.next()).isTrue();
            return rs.getLong(1);
        }
    }

    private static boolean hasConstraint(java.sql.Connection connection, String name) throws SQLException {
        try (var statement = connection.prepareStatement("""
                SELECT 1
                FROM pg_constraint
                WHERE conname = ?
                """)) {
            statement.setString(1, name);
            try (var rs = statement.executeQuery()) {
                return rs.next();
            }
        }
    }

    private static boolean hasIndex(java.sql.Connection connection, String name) throws SQLException {
        try (var statement = connection.prepareStatement("""
                SELECT 1
                FROM pg_class
                WHERE relname = ?
                """)) {
            statement.setString(1, name);
            try (var rs = statement.executeQuery()) {
                return rs.next();
            }
        }
    }

    private static long countReviewsForTransaction(java.sql.Connection connection, UUID transactionId) throws SQLException {
        try (var statement = connection.prepareStatement("""
                SELECT COUNT(*)
                FROM reviews
                WHERE transaction_id = ?
                """)) {
            statement.setObject(1, transactionId);
            try (var rs = statement.executeQuery()) {
                assertThat(rs.next()).isTrue();
                return rs.getLong(1);
            }
        }
    }

    private static void assertUsernamePolicy(List<String> usernames) {
        assertThat(usernames).allSatisfy(username -> {
            assertThat(username).isEqualTo(username.trim());
            assertThat(username).isEqualTo(username.toLowerCase(java.util.Locale.ROOT));
            assertThat(username.length()).isBetween(3, 50);
        });
    }
}
