package com.educycle.shared.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifies admin password hash applied by {@code V5__fix_admin_password_hash.sql} matches NOTES ({@code admin@1}).
 */
class SeedPasswordHashTest {

    /** Must stay in sync with V5 migration UPDATE for admin@educycle.com */
    private static final String ADMIN_HASH_AFTER_V5 =
            "$2a$11$rKaPf4vIrVgZqa5Y.uhOnOHwFBsf0wWNk0bP48o9ZdUFZO6j1.1tK";

    @Test
    void adminDocumentedPasswordMatchesV5MigrationHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(11);
        assertTrue(encoder.matches("admin@1", ADMIN_HASH_AFTER_V5),
                "Regenerate V5 hash with BCryptPasswordEncoder(11).encode(\"admin@1\") and update migration + this constant");
    }
}
