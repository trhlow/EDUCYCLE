package com.educycle.auth.application.service.impl;

import com.educycle.auth.api.dto.request.ChangePasswordRequest;
import com.educycle.auth.api.dto.request.ForgotPasswordRequest;
import com.educycle.auth.api.dto.request.LoginRequest;
import com.educycle.auth.api.dto.request.RegisterRequest;
import com.educycle.auth.api.dto.request.ResendOtpRequest;
import com.educycle.auth.api.dto.request.ResetPasswordRequest;
import com.educycle.auth.api.dto.request.VerifyOtpRequest;
import com.educycle.auth.api.dto.request.VerifyPhoneRequest;
import com.educycle.auth.api.dto.response.AuthResponse;
import com.educycle.auth.api.dto.response.RegisterPendingResponse;
import com.educycle.auth.application.service.AuthService;
import com.educycle.auth.application.usecase.AuthAccountUseCase;
import com.educycle.auth.application.usecase.AuthRegistrationUseCase;
import com.educycle.auth.application.usecase.AuthSessionUseCase;
import com.educycle.auth.application.usecase.PasswordRecoveryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthRegistrationUseCase registrationUseCase;
    private final AuthSessionUseCase sessionUseCase;
    private final AuthAccountUseCase accountUseCase;
    private final PasswordRecoveryUseCase passwordRecoveryUseCase;

    @Override
    public RegisterPendingResponse register(RegisterRequest request) {
        return registrationUseCase.register(request);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        return sessionUseCase.login(request);
    }

    @Override
    public boolean verifyPhone(UUID userId, VerifyPhoneRequest request) {
        return accountUseCase.verifyPhone(userId, request);
    }

    @Override
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        return registrationUseCase.verifyOtp(request);
    }

    @Override
    public boolean resendOtp(ResendOtpRequest request) {
        return registrationUseCase.resendOtp(request);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        return sessionUseCase.refreshToken(refreshToken);
    }

    @Override
    public void logout(String refreshToken) {
        sessionUseCase.logout(refreshToken);
    }

    @Override
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        accountUseCase.changePassword(userId, request);
    }

    @Override
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        return passwordRecoveryUseCase.forgotPassword(request);
    }

    @Override
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        return passwordRecoveryUseCase.resetPassword(request);
    }
}
