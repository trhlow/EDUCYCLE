package com.educycle.auth.application.usecase;

import com.educycle.auth.api.dto.request.ForgotPasswordRequest;
import com.educycle.auth.api.dto.request.ResetPasswordRequest;
import com.educycle.auth.application.support.AuthRefreshTokens;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.mail.MailService;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.educycle.auth.application.support.AuthEmailPolicy.normalize;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PasswordRecoveryUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AuthRefreshTokens refreshTokens;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        String email = normalize(request.email());
        try {
            Optional<User> found = userRepository.findByEmail(email);
            if (found.isPresent()) {
                User user = found.get();
                String token = UUID.randomUUID().toString().replace("-", "");
                user.setPasswordResetToken(token);
                user.setPasswordResetTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
                userRepository.save(user);
                sendResetLink(user, token);
            }
        } finally {
            passwordEncoder.encode("educycle.forgot-password.constant-time-pad");
        }
        return Map.of("message", MessageConstants.FORGOT_PASSWORD_GENERIC_RESPONSE);
    }

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
        refreshTokens.clear(user);
        userRepository.save(user);
        return Map.of("message", MessageConstants.RESET_PASSWORD_SUCCESS);
    }

    private void sendResetLink(User user, String token) {
        String base = frontendBaseUrl == null ? "http://localhost:5173" : frontendBaseUrl.replaceAll("/+$", "");
        String link = base + "/auth?resetToken=" + token;
        String body = String.format(
                "Xin chao %s,%n%nBan (hoac ai do) da yeu cau dat lai mat khau EduCycle.%n"
                        + "Mo lien ket sau tren trinh duyet:%n%s%n%nLien ket het han sau 1 gio.%n"
                        + "Neu khong phai ban, hay bo qua email nay.",
                user.getUsername(), link);
        if (!mailService.sendPlain(user.getEmail(), "EduCycle - dat lai mat khau", body)) {
            log.warn("Quen mat khau - lien ket dat lai (dev fallback): {}", link);
        }
    }
}
