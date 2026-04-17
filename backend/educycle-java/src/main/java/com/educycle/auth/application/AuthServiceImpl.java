package com.educycle.auth.application;

import com.educycle.auth.dto.*;
import com.educycle.user.domain.Role;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.user.domain.User;
import com.educycle.user.persistence.UserRepository;
import com.educycle.shared.security.JwtTokenProvider;
import com.educycle.auth.application.AuthService;
import com.educycle.shared.mail.MailService;
import com.educycle.shared.util.MessageConstants;
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
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository   userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder  passwordEncoder;
    private final MailService      mailService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    /** Chỉ bật trong CI E2E ({@code EDUCYCLE_E2E_FIXED_OTP}) — không dùng production. */
    @Value("${educycle.e2e-fixed-otp:}")
    private String e2eFixedOtp;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /** Khớp {@link com.educycle.auth.dto.RegisterRequest} — có @ và đuôi .edu.vn. */
    private static final Pattern EDU_VN_EMAIL = Pattern.compile("(?i)^[^@\\s]+@[^@\\s]+\\.edu\\.vn$");

    // ── Register — không cấp JWT; sinh viên phải nhập OTP gửi về email .edu.vn ──

    @Override
    public RegisterPendingResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException(MessageConstants.EMAIL_ALREADY_EXISTS);
        }

        String otpToken = nextOtpForEmailVerification();

        User user = User.builder()
                .username(request.username())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .emailVerified(false)
                .phoneVerified(false)
                .emailVerificationToken(otpToken)
                .emailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES))
                .tradingAllowed(isEduVnInstitutionEmail(email))
                .build();

        userRepository.save(user);

        log.warn("Đăng ký thành công: {} — mã OTP xác thực email (xem thêm log MailService nếu không dùng SMTP): {}", email, otpToken);
        sendVerificationOtpEmail(user, otpToken);
        return new RegisterPendingResponse(MessageConstants.REGISTER_OTP_SENT, email, user.getUsername());
    }

    // ── Login — chỉ sau khi email đã xác thực OTP ───────────────────────────

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS);
        }

        if (!user.isEmailVerified()) {
            throw new UnauthorizedException(MessageConstants.EMAIL_NOT_VERIFIED_LOGIN);
        }

        user.setTradingAllowed(isTradingAllowedForUser(user));
        startNewRefreshChain(user);
        userRepository.save(user);

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

    // ── Email OTP — sau khi đúng OTP: cấp JWT + refresh (đăng nhập đầy đủ) ──

    @Override
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
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
        user.setTradingAllowed(isEduVnInstitutionEmail(user.getEmail()));
        startNewRefreshChain(user);
        userRepository.save(user);

        log.info("Đã xác thực email và cấp phiên cho: {}", email);
        return toAuthResponse(user, MessageConstants.EMAIL_VERIFIED_SUCCESS);
    }

    @Override
    public boolean resendOtp(ResendOtpRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException(MessageConstants.EMAIL_NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new BadRequestException(MessageConstants.EMAIL_ALREADY_VERIFIED);
        }

        String otp = nextOtpForEmailVerification();
        user.setEmailVerificationToken(otp);
        user.setEmailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
        userRepository.save(user);

        log.warn("Gửi lại OTP cho {} — mã mới (xem thêm log MailService nếu không dùng SMTP): {}", email, otp);
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

        if (!user.isEmailVerified()) {
            clearRefreshSession(user);
            userRepository.save(user);
            throw new UnauthorizedException(MessageConstants.EMAIL_NOT_VERIFIED_LOGIN);
        }

        if (user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            clearRefreshSession(user);
            userRepository.save(user);
            throw new UnauthorizedException(MessageConstants.REFRESH_TOKEN_EXPIRED);
        }

        rotateRefreshToken(user);
        user.setTradingAllowed(isTradingAllowedForUser(user));
        userRepository.save(user);

        return toAuthResponse(user, null);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        userRepository.findByRefreshToken(refreshToken).ifPresent(user -> {
            clearRefreshSession(user);
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
        clearRefreshSession(user);
        userRepository.save(user);
    }

    @Override
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());
        try {
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
                if (!mailService.sendPlain(user.getEmail(), "EduCycle — đặt lại mật khẩu", body)) {
                    log.warn("Quên mật khẩu — liên kết đặt lại (chỉ dev / khi không gửi được SMTP): {}", link);
                }
            }
        } finally {
            // Chuẩn hóa chi phí CPU giữa email tồn tại / không — giảm enumerate qua timing (không thay thế rate limit).
            passwordEncoder.encode("educycle.forgot-password.constant-time-pad");
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
        clearRefreshSession(user);
        userRepository.save(user);
        return Map.of("message", MessageConstants.RESET_PASSWORD_SUCCESS);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private String nextOtpForEmailVerification() {
        if (e2eFixedOtp != null && !e2eFixedOtp.isBlank()) {
            return e2eFixedOtp.trim();
        }
        return generateOtp();
    }

    private void startNewRefreshChain(User user) {
        user.setRefreshTokenFamily(UUID.randomUUID());
        user.setRefreshToken(jwtTokenProvider.generateRefreshToken());
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
    }

    /** Giữ nguyên family — chỉ đổi token (rotation). */
    private void rotateRefreshToken(User user) {
        if (user.getRefreshTokenFamily() == null) {
            user.setRefreshTokenFamily(UUID.randomUUID());
        }
        user.setRefreshToken(jwtTokenProvider.generateRefreshToken());
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
    }

    private void clearRefreshSession(User user) {
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        user.setRefreshTokenFamily(null);
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

    private static boolean isEduVnInstitutionEmail(String normalizedEmail) {
        return normalizedEmail != null && EDU_VN_EMAIL.matcher(normalizedEmail).matches();
    }

    /** Khớp {@link com.educycle.shared.util.TradingAccess}: ADMIN luôn được coi là có quyền giao dịch; USER cần .edu.vn. */
    private static boolean isTradingAllowedForUser(User user) {
        return user.getRole() == Role.ADMIN || isEduVnInstitutionEmail(user.getEmail());
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
