package com.educycle.auth.application.usecase;

import com.educycle.auth.api.dto.request.RegisterRequest;
import com.educycle.auth.api.dto.request.ResendOtpRequest;
import com.educycle.auth.api.dto.request.VerifyOtpRequest;
import com.educycle.auth.api.dto.response.AuthResponse;
import com.educycle.auth.api.dto.response.RegisterPendingResponse;
import com.educycle.auth.application.support.AuthRefreshTokens;
import com.educycle.auth.application.support.AuthResponses;
import com.educycle.auth.application.support.OtpCodeGenerator;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.mail.MailService;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static com.educycle.auth.application.support.AuthEmailPolicy.isEduVnInstitutionEmail;
import static com.educycle.auth.application.support.AuthEmailPolicy.normalize;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthRegistrationUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final OtpCodeGenerator otpCodeGenerator;
    private final AuthRefreshTokens refreshTokens;
    private final AuthResponses authResponses;

    public RegisterPendingResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        return userRepository.findByEmail(email)
                .map(existing -> reregisterUnverifiedIfNeeded(request, email, existing))
                .orElseGet(() -> registerNewUser(request, email));
    }

    private RegisterPendingResponse registerNewUser(RegisterRequest request, String email) {
        String otpToken = otpCodeGenerator.next();
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
        log.info("Dang ky thanh cong, da gui OTP: email={} userId={}", email, user.getId());
        sendVerificationOtpEmail(user, otpToken);
        return new RegisterPendingResponse(MessageConstants.REGISTER_OTP_SENT, email, user.getUsername());
    }

    private RegisterPendingResponse reregisterUnverifiedIfNeeded(
            RegisterRequest request, String email, User existing) {
        if (existing.isEmailVerified()) {
            throw new BadRequestException(MessageConstants.EMAIL_ALREADY_EXISTS);
        }
        String otpToken = otpCodeGenerator.next();
        existing.setUsername(request.username());
        existing.setPasswordHash(passwordEncoder.encode(request.password()));
        existing.setEmailVerificationToken(otpToken);
        existing.setEmailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
        existing.setTradingAllowed(isEduVnInstitutionEmail(email));
        userRepository.save(existing);
        log.info("Dang ky lai (email chua verify), da gui OTP moi: email={} userId={}", email, existing.getId());
        sendVerificationOtpEmail(existing, otpToken);
        return new RegisterPendingResponse(MessageConstants.REGISTER_OTP_SENT, email, existing.getUsername());
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String email = normalize(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException(MessageConstants.EMAIL_NOT_FOUND));

        String storedToken = user.getEmailVerificationToken();
        Instant expiry = user.getEmailVerificationTokenExpiry();
        String submitted = request.otp() == null ? "" : request.otp().trim();
        boolean valid = expiry != null
                && expiry.isAfter(Instant.now())
                && emailOtpEquals(storedToken, submitted);

        if (!valid) {
            log.warn("OTP khong hop le (khong ghi ma): email={} userId={}", email, user.getId());
            throw new BadRequestException(MessageConstants.OTP_INVALID_OR_EXPIRED);
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        user.setTradingAllowed(isEduVnInstitutionEmail(user.getEmail()));
        String plainRt = refreshTokens.startNewChain(user);
        userRepository.save(user);

        log.info("Da xac thuc email va cap phien: email={} userId={}", email, user.getId());
        return authResponses.auth(user, MessageConstants.EMAIL_VERIFIED_SUCCESS, plainRt);
    }

    public boolean resendOtp(ResendOtpRequest request) {
        String email = normalize(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException(MessageConstants.EMAIL_NOT_FOUND));

        if (user.isEmailVerified()) {
            throw new BadRequestException(MessageConstants.EMAIL_ALREADY_VERIFIED);
        }

        String otp = otpCodeGenerator.next();
        user.setEmailVerificationToken(otp);
        user.setEmailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES));
        userRepository.save(user);

        log.info("Gui lai OTP (khong ghi ma): email={} userId={}", email, user.getId());
        sendVerificationOtpEmail(user, otp);
        return true;
    }

    private static boolean emailOtpEquals(String stored, String provided) {
        if (stored == null || provided == null) {
            return false;
        }
        byte[] a = stored.getBytes(StandardCharsets.UTF_8);
        byte[] b = provided.getBytes(StandardCharsets.UTF_8);
        if (a.length != b.length) {
            return false;
        }
        return MessageDigest.isEqual(a, b);
    }

    private void sendVerificationOtpEmail(User user, String otp) {
        String body = String.format(
                "Xin chao %s,%n%nMa OTP xac thuc email EduCycle cua ban: %s%nHieu luc 30 phut.%n",
                user.getUsername(), otp);
        mailService.sendPlain(user.getEmail(), "EduCycle - ma xac thuc email", body);
    }
}
