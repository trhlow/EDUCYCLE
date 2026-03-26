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
import com.educycle.service.GoogleOAuthCodeExchangeService;
import com.educycle.service.MailService;
import com.educycle.service.OAuthTokenVerifier;
import com.educycle.util.MessageConstants;
import com.educycle.util.OtpHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
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
    private final OAuthTokenVerifier   oAuthTokenVerifier;
    private final GoogleOAuthCodeExchangeService googleOAuthCodeExchangeService;
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
                // Store the SHA-256 hash of the OTP — never persist plaintext tokens.
                .emailVerificationToken(OtpHasher.hash(otpToken))
                .emailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES))
                .build();

        User savedUser = userRepository.save(user);
        if (savedUser != null) user = savedUser;
        String rawRefreshToken = startNewRefreshChain(user);
        userRepository.save(user);

        log.info("Đăng ký thành công: {}", email);
        sendVerificationOtpEmail(user, otpToken);
        return toAuthResponse(user, rawRefreshToken, MessageConstants.REGISTER_OTP_SENT);
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

        String rawRefreshToken = startNewRefreshChain(user);
        userRepository.save(user);

        return toAuthResponse(user, rawRefreshToken, null);
    }

    // ── Social Login (Google / Microsoft) ─────────────────────────────────

    @Override
    public AuthResponse socialLogin(SocialLoginRequest request) {
        boolean googleCode = "google".equalsIgnoreCase(request.provider())
                && request.authorizationCode() != null
                && !request.authorizationCode().isBlank();
        boolean hasToken = request.token() != null && !request.token().isBlank();
        if (!googleCode && !hasToken) {
            throw new BadRequestException(MessageConstants.OAUTH_TOKEN_REQUIRED);
        }

        String verifiedEmail;
        if (googleCode) {
            verifiedEmail = googleOAuthCodeExchangeService.exchangeCodeForEmail(
                    request.authorizationCode(),
                    request.redirectUri());
        } else {
            verifiedEmail = oAuthTokenVerifier.verifyAndExtractEmail(
                    request.provider().toLowerCase().trim(),
                    request.token());
        }

        String username = verifiedEmail.split("@")[0];

        User user = userRepository.findByEmail(verifiedEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .username(username)
                    .email(verifiedEmail)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.USER)
                    .emailVerified(true)
                    .phoneVerified(false)
                    .build();
            userRepository.save(newUser);
            log.info("Đăng nhập mạng xã hội: đã tạo người dùng mới — nhà cung cấp={}", request.provider());
            return newUser;
        });

        // Start a new refresh chain on every social login (new family).
        String rawRefreshToken = startNewRefreshChain(user);
        userRepository.save(user);

        return toAuthResponse(user, rawRefreshToken, null);
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

        String storedHash = user.getEmailVerificationToken();
        Instant expiry    = user.getEmailVerificationTokenExpiry();

        // Compare using the hash — plaintext OTP is never read back from the DB.
        boolean valid = storedHash != null
                && OtpHasher.verify(request.otp(), storedHash)
                && expiry != null
                && expiry.isAfter(Instant.now());

        if (!valid) {
            log.warn("OTP không hợp lệ cho email: {}", email);
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
        user.setEmailVerificationToken(OtpHasher.hash(otp));
        user.setEmailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
        userRepository.save(user);

        log.info("Đã gửi lại OTP cho {}", email);
        sendVerificationOtpEmail(user, otp);
        return true;
    }

    // ── Refresh / Logout ───────────────────────────────────────────────────

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException(MessageConstants.REFRESH_TOKEN_REQUIRED);
        }

        String tokenHash = hashToken(refreshToken);

        // Replay-attack detection: if the presented token matches a *previous* (already-
        // rotated) token, an attacker is replaying a stolen token.  Invalidate the whole
        // family immediately to protect the legitimate session owner.
        Optional<User> replayCandidate = userRepository.findByPreviousRefreshToken(tokenHash);
        if (replayCandidate.isPresent()) {
            User staleUser = replayCandidate.get();
            log.warn("Refresh token replay detected — invalidating family={}", staleUser.getRefreshTokenFamily());
            clearRefreshSession(staleUser);
            userRepository.save(staleUser);
            throw new UnauthorizedException(MessageConstants.INVALID_REFRESH_TOKEN);
        }

        User user = userRepository.findByRefreshToken(tokenHash)
                .orElseThrow(() -> new UnauthorizedException(MessageConstants.INVALID_REFRESH_TOKEN));

        if (user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            clearRefreshSession(user);
            userRepository.save(user);
            throw new UnauthorizedException(MessageConstants.REFRESH_TOKEN_EXPIRED);
        }

        String rawNewToken = rotateRefreshToken(user);
        userRepository.save(user);

        return toAuthResponse(user, rawNewToken, null);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        String tokenHash = hashToken(refreshToken);
        userRepository.findByRefreshToken(tokenHash).ifPresent(user -> {
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
        Optional<User> found = userRepository.findByEmail(email);
        if (found.isPresent()) {
            User user = found.get();
            // Use SecureRandom (256-bit URL-safe token) instead of UUID.
            byte[] tokenBytes = new byte[32];
            SECURE_RANDOM.nextBytes(tokenBytes);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
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
        clearRefreshSession(user);
        userRepository.save(user);
        return Map.of("message", MessageConstants.RESET_PASSWORD_SUCCESS);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Start a new refresh-token chain (new family).  Returns the <em>raw</em>
     * (plaintext) token that must be sent to the client; only the SHA-256 hash
     * is written to the database.
     */
    private String startNewRefreshChain(User user) {
        String rawToken = jwtTokenProvider.generateRefreshToken();
        user.setRefreshTokenFamily(UUID.randomUUID());
        user.setRefreshToken(hashToken(rawToken));
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        user.setPreviousRefreshToken(null);
        return rawToken;
    }

    /**
     * Rotate within the same family.  Promotes the current hash to
     * {@code previousRefreshToken} so replay attacks can be detected, then
     * stores the hash of the new token.  Returns the raw token for the client.
     */
    private String rotateRefreshToken(User user) {
        if (user.getRefreshTokenFamily() == null) {
            user.setRefreshTokenFamily(UUID.randomUUID());
        }
        user.setPreviousRefreshToken(user.getRefreshToken());
        String rawToken = jwtTokenProvider.generateRefreshToken();
        user.setRefreshToken(hashToken(rawToken));
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        return rawToken;
    }

    private void clearRefreshSession(User user) {
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        user.setRefreshTokenFamily(null);
        user.setPreviousRefreshToken(null);
    }

    private AuthResponse toAuthResponse(User user, String rawRefreshToken, String message) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                jwtTokenProvider.generateToken(user),
                user.getRole().name(),
                user.isEmailVerified(),
                message,
                rawRefreshToken,
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

    /**
     * SHA-256 hex hash used for safe DB storage of opaque tokens (refresh tokens).
     * Delegates to {@link OtpHasher#hash} to keep a single hashing implementation.
     */
    static String hashToken(String token) {
        return OtpHasher.hash(token);
    }

    private void sendVerificationOtpEmail(User user, String otp) {
        String body = String.format(
                "Xin chào %s,%n%nMã OTP xác thực email EduCycle của bạn: %s%nHiệu lực 30 phút.%n",
                user.getUsername(), otp);
        mailService.sendPlain(user.getEmail(), "EduCycle — mã xác thực email", body);
    }
}
