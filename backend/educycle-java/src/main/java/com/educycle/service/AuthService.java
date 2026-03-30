package com.educycle.service;

import com.educycle.dto.auth.*;

import java.util.Map;
import java.util.UUID;

/**
 * Maps C# IAuthService interface.
 */
public interface AuthService {

    RegisterPendingResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    boolean verifyPhone(UUID userId, VerifyPhoneRequest request);

    AuthResponse verifyOtp(VerifyOtpRequest request);

    boolean resendOtp(ResendOtpRequest request);

    AuthResponse refreshToken(String refreshToken);

    void logout(String refreshToken);

    void changePassword(UUID userId, ChangePasswordRequest request);

    Map<String, String> forgotPassword(ForgotPasswordRequest request);

    Map<String, String> resetPassword(ResetPasswordRequest request);
}
