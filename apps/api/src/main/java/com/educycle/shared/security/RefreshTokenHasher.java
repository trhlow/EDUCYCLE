package com.educycle.shared.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Opaque refresh tokens are never stored in plaintext — only SHA-256 hex in {@code users.refresh_token}.
 */
public final class RefreshTokenHasher {

    private RefreshTokenHasher() {
    }

    public static String sha256Hex(String plain) {
        if (plain == null || plain.isBlank()) {
            return null;
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(plain.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
