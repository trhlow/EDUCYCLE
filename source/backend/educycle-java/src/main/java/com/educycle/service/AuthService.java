package com.educycle.service;

import com.educycle.dto.auth.*;

import java.util.UUID;

/**
 * Maps C# IAuthService interface.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse socialLogin(SocialLoginRequest request);

    boolean verifyPhone(UUID userId, VerifyPhoneRequest request);

    boolean verifyOtp(VerifyOtpRequest request);

    boolean resendOtp(ResendOtpRequest request);
}
