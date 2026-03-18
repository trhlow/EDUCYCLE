package com.educycle.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Utility for hashing OTPs with SHA-256 before database storage.
 * Prevents plaintext OTP exposure if the database is compromised.
 */
public final class OtpHasher {

    private OtpHasher() {
        // Utility class — no instantiation
    }

    /**
     * Hash a plaintext OTP using SHA-256.
     *
     * @param otp plaintext OTP (e.g. "123456")
     * @return hex-encoded SHA-256 hash
     */
    public static String hash(String otp) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /**
     * Verify a plaintext OTP against its stored hash.
     *
     * @param plainOtp   the OTP entered by the user
     * @param storedHash the SHA-256 hash from the database
     * @return true if the OTP matches the hash
     */
    public static boolean verify(String plainOtp, String storedHash) {
        if (plainOtp == null || storedHash == null) return false;
        return hash(plainOtp).equals(storedHash);
    }
}
