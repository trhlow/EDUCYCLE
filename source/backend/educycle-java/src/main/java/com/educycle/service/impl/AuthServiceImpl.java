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
import com.educycle.service.MailService;
import com.educycle.service.OAuthTokenVerifier;
import com.educycle.util.MessageConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository       userRepository;
    private final JwtTokenProvider     jwtTokenProvider;
    private final PasswordEncoder      passwordEncoder;
    private final OAuthTokenVerifier   oAuthTokenVerifier; // NEW
    private final MailService          mailService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ── Register ───────────────────────────────────────────────────────────

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException(MessageConstants.EMAIL_ALREADY_EXISTS);
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

        User savedUser = userRepository.save(user);
        if (savedUser != null) user = savedUser;
        populateRefreshToken(user);
        userRepository.save(user);

        log.info("Đăng ký thành công: {} | OTP (log khi chưa cấu hình SMTP): {}", email, otpToken);
        sendVerificationOtpEmail(user, otpToken);
        return toAuthResponse(user, MessageConstants.REGISTER_OTP_SENT);
    }

    // ── Login ──────────────────────────────────────────────────────────────

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS);
        }

        populateRefreshToken(user);
        userRepository.save(user);

        return toAuthResponse(user, null);
    }

    // ── Social Login (Google / Microsoft) ─────────────────────────────────
    //
    // Flow:
    //  1. FE calls Google/Microsoft SDK → receives ID token
    //  2. FE sends { provider, token } to POST /api/auth/social-login
    //  3. OAuthTokenVerifier validates the token against Google/Microsoft JWKS
    //  4. Extract email → find or create user → issue our own JWT
    //
    // Security: the token is cryptographically verified — we never trust
    // the email from the request body directly.

    @Override
    public AuthResponse socialLogin(SocialLoginRequest request) {
        if (request.token() == null || request.token().isBlank()) {
            throw new BadRequestException(MessageConstants.OAUTH_TOKEN_REQUIRED);
        }

        // Verify token and extract email (throws BadRequestException on failure)
        String verifiedEmail = oAuthTokenVerifier.verifyAndExtractEmail(
                request.provider().toLowerCase().trim(),
                request.token()
        );

        String username = verifiedEmail.split("@")[0];

        User user = userRepository.findByEmail(verifiedEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .username(username)
                    .email(verifiedEmail)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.USER)
                    .emailVerified(true)   // email is verified by the OAuth provider
                    .phoneVerified(false)
                    .build();
            populateRefreshToken(newUser);
            userRepository.save(newUser);
            log.info("Đăng nhập mạng xã hội: đã tạo người dùng mới — nhà cung cấp={}, email={}", request.provider(), verifiedEmail);
            return newUser;
        });

        // Refresh token on every login
        if (user.getId() != null) {
            populateRefreshToken(user);
            userRepository.save(user);
        }

        return toAuthResponse(user, null);
    }

    // ── Phone verification ─────────────────────────────────────────────────

    @Override
    public boolean verifyPhone(UUID userId, VerifyPhoneRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
        user.setPhone(request.phone());
        user.setPhoneVerified(true);
        userRepository.save(user);
        return true;
    }

    // ── Email OTP verification ─────────────────────────────────────────────

    @Override
    public boolean verifyOtp(VerifyOtpRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException(MessageConstants.EMAIL_NOT_FOUND));

        String storedToken = user.getEmailVerificationToken();
        Instant expiry     = user.getEmailVerificationTokenExpiry();

        boolean valid = storedToken != null
                && storedToken.equals(request.otp())
                && expiry != null
                && expiry.isAfter(Instant.now());

        if (!valid) {
            log.warn("OTP không hợp lệ cho {}: expected={}, got={}", email, storedToken, request.otp());
            throw new BadRequestException(MessageConstants.OTP_INVALID_OR_EXPIRED);
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        log.info("Đã xác thực email cho: {}", email);
        return true;
    }

    @Override
    public boolean resendOtp(ResendOtpRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException(MessageConstants.EMAIL_NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new BadRequestException(MessageConstants.EMAIL_ALREADY_VERIFIED);
        }

        String otp = generateOtp();
        user.setEmailVerificationToken(otp);
        user.setEmailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
        userRepository.save(user);

        log.info("Đã gửi lại OTP cho {} | OTP (log khi chưa cấu hình SMTP): {}", email, otp);
        sendVerificationOtpEmail(user, otp);
        return true;
    }

    // ── Refresh / Logout ───────────────────────────────────────────────────

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException(MessageConstants.REFRESH_TOKEN_REQUIRED);
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException(MessageConstants.INVALID_REFRESH_TOKEN));

        if (user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
            throw new UnauthorizedException(MessageConstants.REFRESH_TOKEN_EXPIRED);
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

    @Override
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException(MessageConstants.CURRENT_PASSWORD_WRONG);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Override
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());
        Optional<User> found = userRepository.findByEmail(email);
        if (found.isPresent()) {
            User user = found.get();
            String token = UUID.randomUUID().toString().replace("-", "");
            user.setPasswordResetToken(token);
            user.setPasswordResetTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
            userRepository.save(user);
            String base = frontendBaseUrl == null ? "http://localhost:5173" : frontendBaseUrl.replaceAll("/+$", "");
            String link = base + "/auth?resetToken=" + token;
            String body = String.format(
                    "Xin chào %s,%n%nBạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu EduCycle.%n"
                            + "Mở liên kết sau trên trình duyệt:%n%s%n%nLiên kết hết hạn sau 1 giờ.%n"
                            + "Nếu không phải bạn, hãy bỏ qua email này.",
                    user.getUsername(), link);
            mailService.sendPlain(user.getEmail(), "EduCycle — đặt lại mật khẩu", body);
        }
        return Map.of("message", MessageConstants.FORGOT_PASSWORD_GENERIC_RESPONSE);
    }

    @Override
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        String rawToken = request.token() == null ? "" : request.token().trim();
        User user = userRepository.findByPasswordResetToken(rawToken)
                .orElseThrow(() -> new BadRequestException(MessageConstants.RESET_TOKEN_INVALID_OR_EXPIRED));
        if (user.getPasswordResetTokenExpiry() == null
                || user.getPasswordResetTokenExpiry().isBefore(Instant.now())) {
            throw new BadRequestException(MessageConstants.RESET_TOKEN_INVALID_OR_EXPIRED);
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
        return Map.of("message", MessageConstants.RESET_PASSWORD_SUCCESS);
    }

    // ── Private helpers ────────────────────────────────────────────────────

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

    private static String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void sendVerificationOtpEmail(User user, String otp) {
        String body = String.format(
                "Xin chào %s,%n%nMã OTP xác thực email EduCycle của bạn: %s%nHiệu lực 30 phút.%n",
                user.getUsername(), otp);
        mailService.sendPlain(user.getEmail(), "EduCycle — mã xác thực email", body);
    }
}
