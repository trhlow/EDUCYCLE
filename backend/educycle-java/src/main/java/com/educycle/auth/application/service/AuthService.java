package com.educycle.auth.application.service;

import com.educycle.auth.api.dto.request.*;
import com.educycle.auth.api.dto.response.*;

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
