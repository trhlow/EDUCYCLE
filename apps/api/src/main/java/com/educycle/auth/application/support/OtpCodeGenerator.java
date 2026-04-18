package com.educycle.auth.application.support;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpCodeGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final String e2eFixedOtp;

    public OtpCodeGenerator(@Value("${educycle.e2e-fixed-otp:}") String e2eFixedOtp) {
        this.e2eFixedOtp = e2eFixedOtp;
    }

    public String next() {
        if (e2eFixedOtp != null && !e2eFixedOtp.isBlank()) {
            return e2eFixedOtp.trim();
        }
        return String.format("%06d", 100000 + SECURE_RANDOM.nextInt(900000));
    }
}
