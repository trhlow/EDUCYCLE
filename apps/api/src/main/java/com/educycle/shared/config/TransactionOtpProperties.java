package com.educycle.shared.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * OTP giao dịch (domain + HTTP rate limit cho endpoint generate/verify).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "educycle.otp.transaction")
public class TransactionOtpProperties {

    /** Số lần nhập sai OTP liên tiếp trước khi khóa (domain). */
    private int maxFailedAttempts = 5;

    /** Thời gian khóa sau khi vượt {@link #maxFailedAttempts} (phút). */
    private int lockMinutes = 30;

    /** Hiệu lực mã OTP sau khi generate (phút). */
    private int expiryMinutes = 30;

    /** Rate limit HTTP: POST verify-otp — số request tối đa / phút / giao dịch / IP. */
    private int httpVerifyPerMinute = 5;

    /** Rate limit HTTP: POST generate OTP — số request tối đa trong một cửa sổ thời gian / giao dịch / IP. */
    private int httpGeneratePerWindow = 3;

    /** Độ dài cửa sổ cho {@link #httpGeneratePerWindow} (phút). */
    private int httpGenerateWindowMinutes = 5;
}
