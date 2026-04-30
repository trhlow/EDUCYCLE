package com.educycle.auth.application.support;

import java.util.Locale;

/**
 * Usernames are stored and compared in a normalized form so that {@code Alice} and {@code alice}
 * cannot coexist (matches common "unique username" expectations).
 */
public final class AuthUsernamePolicy {

    public static final int MIN_LENGTH = 3;
    public static final int MAX_LENGTH = 50;

    private AuthUsernamePolicy() {
    }

    /** Trim + lowercase (ROOT) — must match DB semantics after Flyway normalize migration. */
    public static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isValidNormalized(String normalized) {
        return normalized != null
                && normalized.length() >= MIN_LENGTH
                && normalized.length() <= MAX_LENGTH;
    }
}
