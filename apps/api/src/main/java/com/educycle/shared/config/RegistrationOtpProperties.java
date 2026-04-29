package com.educycle.shared.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * OTP đăng ký / verify email — TTL và các ngưỡng sau này có thể mở rộng tại đây.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "educycle.otp.registration")
public class RegistrationOtpProperties {

    /** Hiệu lực mã OTP đăng ký và resend (phút). */
    private int expireMinutes = 30;
}
