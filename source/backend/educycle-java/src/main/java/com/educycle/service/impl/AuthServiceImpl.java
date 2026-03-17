package com.educycle.service.impl;

import com.educycle.dto.auth.*;
import com.educycle.enums.Role;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.UnauthorizedException;
import com.educycle.model.User;
import com.educycle.repository.UserRepository;
import com.educycle.security.JwtTokenProvider;
import com.educycle.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Maps C# AuthService.cs
 *
 * Key differences:
 *  - BCrypt.Net.BCrypt.HashPassword()   → passwordEncoder.encode()
 *  - BCrypt.Net.BCrypt.Verify()         → passwordEncoder.matches()
 *  - _jwtTokenGenerator.GenerateToken() → jwtTokenProvider.generateToken()
 *  - Task<T> async                      → synchronous (Spring MVC thread-per-request)
 *  - throw new BadRequestException()    → same custom exception, different package
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    // ===== REGISTER =====

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user, null);
    }

    // ===== LOGIN =====

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return buildAuthResponse(user, null);
    }

    // ===== SOCIAL LOGIN =====

    @Override
    public AuthResponse socialLogin(SocialLoginRequest request) {
        String email = resolveEmail(request);
        String username = email.split("@")[0];

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .id(UUID.randomUUID())
                    .username(username)
                    .email(email)
                    // Random unhashable password — OAuth users cannot use password login
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.USER)
                    .emailVerified(true)  // social login = email trusted
                    .phoneVerified(false)
                    .build();
            userRepository.save(newUser);
            log.info("Social login: new user created for provider={} email={}", request.provider(), email);
            return newUser;
        });

        return buildAuthResponse(user, null);
    }

    // ===== VERIFY PHONE =====

    @Override
    public boolean verifyPhone(UUID userId, VerifyPhoneRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPhone(request.phone());
        user.setPhoneVerified(true);
        userRepository.save(user);
        return true;
    }

    // ===== OTP (stub — for full OTP support add email service integration) =====

    @Override
    public boolean verifyOtp(VerifyOtpRequest request) {
        // TODO: Integrate with email service for real OTP verification
        // Placeholder: in C# this was in AuthServiceWithOtp
        log.warn("verifyOtp called but OTP email service is not yet configured");
        return true;
    }

    @Override
    public boolean resendOtp(ResendOtpRequest request) {
        // TODO: Resend OTP via email service
        log.warn("resendOtp called but OTP email service is not yet configured");
        return true;
    }

    // ===== Private Helpers =====

    private AuthResponse buildAuthResponse(User user, String message) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                jwtTokenProvider.generateToken(user),
                user.getRole().name(),
                user.isEmailVerified(),
                message
        );
    }

    private String resolveEmail(SocialLoginRequest request) {
        if (request.email() != null && !request.email().isBlank()) {
            return request.email();
        }
        return switch (request.provider().toLowerCase()) {
            case "microsoft" -> "student@university.edu.vn";
            case "google"    -> "student@gmail.com";
            case "facebook"  -> "student@facebook.com";
            default -> throw new BadRequestException("Unsupported provider: " + request.provider());
        };
    }
}
