package com.educycle.util;

import com.educycle.config.JwtProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Băm OTP trước khi lưu DB: HMAC-SHA256 với secret server (chống rainbow table).
 * Vẫn chấp nhận hash SHA-256 cũ khi verify để tương thích dữ liệu đã có.
 */
@Component
public class OtpHasher {

    private static final String HMAC_ALG = "HmacSHA256";

    private final byte[] secretBytes;

    public OtpHasher(
            @Value("${educycle.otp.hmac-secret:}") String configuredSecret,
            JwtProperties jwtProperties) {
        String raw = StringUtils.hasText(configuredSecret) ? configuredSecret : jwtProperties.getSecret();
        if (!StringUtils.hasText(raw) || raw.length() < 32) {
            throw new IllegalStateException(MessageConstants.JWT_SECRET_REQUIRED);
        }
        this.secretBytes = raw.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Hash OTP để lưu DB (HMAC-SHA256 hex).
     */
    public String hash(String otp) {
        if (otp == null) {
            throw new IllegalArgumentException("otp");
        }
        try {
            Mac mac = Mac.getInstance(HMAC_ALG);
            mac.init(new SecretKeySpec(secretBytes, HMAC_ALG));
            byte[] out = mac.doFinal(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(out);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC-SHA256 not available", e);
        }
    }

    /**
     * So khớp OTP nhập với hash đã lưu (HMAC mới hoặc SHA-256 legacy).
     */
    public boolean verify(String plainOtp, String storedHash) {
        if (plainOtp == null || storedHash == null) {
            return false;
        }
        if (hash(plainOtp).equals(storedHash)) {
            return true;
        }
        return legacySha256Hex(plainOtp).equals(storedHash);
    }

    private static String legacySha256Hex(String otp) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
