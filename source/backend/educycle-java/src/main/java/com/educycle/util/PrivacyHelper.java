package com.educycle.util;

/**
 * Shared utility for masking personal information in API responses.
 * Extracts duplicated maskUsername() logic from ProductServiceImpl and ReviewServiceImpl.
 */
public final class PrivacyHelper {

    private PrivacyHelper() {
        // Utility class — no instantiation
    }

    /**
     * Masks a username for privacy in public responses.
     * <p>Examples:
     * <ul>
     *   <li>"nguyen" → "ngu***n"</li>
     *   <li>"ab"     → "ab***"</li>
     *   <li>null     → "***"</li>
     * </ul>
     *
     * @param username the original username
     * @return the masked username
     */
    public static String maskUsername(String username) {
        if (username == null || username.isBlank()) return "***";
        if (username.length() <= 3) return username + "***";
        return username.substring(0, 3) + "***" + username.charAt(username.length() - 1);
    }
}
