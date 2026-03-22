package com.educycle.service.impl;

import com.educycle.dto.auth.*;
import com.educycle.enums.Role;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.NotFoundException;
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

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email này đã được đăng ký");
        }

        String otpToken = generateOtp();

        User user = User.builder()
                .username(request.username())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .emailVerified(false)
                .phoneVerified(false)
                .emailVerificationToken(otpToken)
                .emailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES))
                .build();

        populateRefreshToken(user);
        userRepository.save(user);

        log.info("Đăng ký thành công: {} | OTP (dev-only): {}", email, otpToken);

        return toAuthResponse(user, "Vui lòng xác thực email bằng mã OTP đã gửi.");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
        }

        populateRefreshToken(user);
        userRepository.save(user);

        return toAuthResponse(user, null);
    }

    @Override
    public AuthResponse socialLogin(SocialLoginRequest request) {
        String email = resolveEmail(request);
        String username = email.split("@")[0];

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.USER)
                    .emailVerified(true)
                    .phoneVerified(false)
                    .build();
            populateRefreshToken(newUser);
            userRepository.save(newUser);
            log.info("Đăng nhập xã hội: tạo user mới provider={} email={}", request.provider(), email);
            return newUser;
        });

        if (user.getId() != null) {
            populateRefreshToken(user);
            userRepository.save(user);
        }

        return toAuthResponse(user, null);
    }

    @Override
    public boolean verifyPhone(UUID userId, VerifyPhoneRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        user.setPhone(request.phone());
        user.setPhoneVerified(true);
        userRepository.save(user);
        return true;
    }

    @Override
    public boolean verifyOtp(VerifyOtpRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy email này"));

        String storedToken = user.getEmailVerificationToken();
        Instant expiry = user.getEmailVerificationTokenExpiry();

        boolean valid = storedToken != null
                && storedToken.equals(request.otp())
                && expiry != null
                && expiry.isAfter(Instant.now());

        if (!valid) {
            log.warn("OTP sai cho {}: expected={}, got={}", email, storedToken, request.otp());
            throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        log.info("Xác thực email thành công: {}", email);
        return true;
    }

    @Override
    public boolean resendOtp(ResendOtpRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy email này"));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email đã được xác thực rồi.");
        }

        String otp = generateOtp();
        user.setEmailVerificationToken(otp);
        user.setEmailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
        userRepository.save(user);

        log.info("Gửi lại OTP cho: {} | OTP (dev-only): {}", email, otp);
        return true;
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Thiếu refresh token");
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Refresh token không hợp lệ"));

        if (user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new UnauthorizedException("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }

        populateRefreshToken(user);
        userRepository.save(user);

        return toAuthResponse(user, null);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        userRepository.findByRefreshToken(refreshToken).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        });
    }

    private void populateRefreshToken(User user) {
        user.setRefreshToken(jwtTokenProvider.generateRefreshToken());
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
    }

    private AuthResponse toAuthResponse(User user, String message) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                jwtTokenProvider.generateToken(user),
                user.getRole().name(),
                user.isEmailVerified(),
                message,
                user.getRefreshToken(),
                user.getRefreshTokenExpiry()
        );
    }

    private static String generateOtp() {
        return String.format("%06d", 100000 + SECURE_RANDOM.nextInt(900000));
    }

    private String resolveEmail(SocialLoginRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new BadRequestException("Đăng nhập xã hội cần có email. Provider: " + request.provider());
        }
        return normalizeEmail(request.email());
    }

    private static String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
