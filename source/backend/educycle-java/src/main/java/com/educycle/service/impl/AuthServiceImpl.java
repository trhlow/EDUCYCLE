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

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

    // ===== OTP — requires email service integration =====

    @Override
    public boolean verifyOtp(VerifyOtpRequest request) {
        // TODO: Integrate with email service for real OTP verification
        throw new BadRequestException("OTP verification is not yet configured. Contact admin.");
    }

    @Override
    public boolean resendOtp(ResendOtpRequest request) {
        // TODO: Resend OTP via email service
        throw new BadRequestException("OTP resend is not yet configured. Contact admin.");
    }

    // ===== REFRESH TOKEN =====

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        return buildAuthResponse(user, null);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        userRepository.findByRefreshToken(refreshToken).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        });
    }

    // ===== Private Helpers =====

    private AuthResponse buildAuthResponse(User user, String message) {
        String refreshToken = jwtTokenProvider.generateRefreshToken();
        Instant refreshExpiry = Instant.now().plus(7, ChronoUnit.DAYS);
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(refreshExpiry);
        userRepository.save(user);

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                jwtTokenProvider.generateToken(user),
                user.getRole().name(),
                user.isEmailVerified(),
                message,
                refreshToken,
                refreshExpiry
        );
    }

    private String resolveEmail(SocialLoginRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new BadRequestException(
                    "Email is required for social login. Provider: " + request.provider());
        }
        return request.email();
    }
}
