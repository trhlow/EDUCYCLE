package com.educycle.migration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class UsernameNormalizeMigrationTest {

    @Test
    @DisplayName("V4 username normalization stays within runtime username length policy")
    void v4UsernameNormalizeMigrationCapsGeneratedUsernamesAtFiftyChars() throws Exception {
        String sql = Files.readString(Path.of("src/main/resources/db/migration/V4__username_normalize_lowercase.sql"));

        assertThat(sql).contains("WHEN LENGTH(r.norm) >= 3 AND r.rn = 1 THEN LEFT(r.norm, 50)");
        assertThat(sql).contains("WHEN LENGTH(r.norm) >= 3 THEN LEFT(r.norm, 41) || '_' || LEFT(REPLACE(u.id::text, '-', ''), 8)");
        assertThat(sql).contains("ELSE 'user_' || LEFT(REPLACE(u.id::text, '-', ''), 8)");
        assertThat(sql).doesNotContain("LEFT(r.norm, 63)");
    }
}
