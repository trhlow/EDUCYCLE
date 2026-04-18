package com.educycle.auth.application.usecase;

import com.educycle.auth.api.dto.request.LoginRequest;
import com.educycle.auth.api.dto.response.AuthResponse;
import com.educycle.auth.application.support.AuthRefreshTokens;
import com.educycle.auth.application.support.AuthResponses;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static com.educycle.auth.application.support.AuthEmailPolicy.isTradingAllowedFor;
import static com.educycle.auth.application.support.AuthEmailPolicy.normalize;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthSessionUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthRefreshTokens refreshTokens;
    private final AuthResponses authResponses;

    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException(MessageConstants.INVALID_CREDENTIALS);
        }
        if (!user.isEmailVerified()) {
            throw new UnauthorizedException(MessageConstants.EMAIL_NOT_VERIFIED_LOGIN);
        }

        user.setTradingAllowed(isTradingAllowedFor(user));
        refreshTokens.startNewChain(user);
        userRepository.save(user);
        return authResponses.auth(user, null);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException(MessageConstants.REFRESH_TOKEN_REQUIRED);
        }

        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException(MessageConstants.INVALID_REFRESH_TOKEN));

        if (!user.isEmailVerified()) {
            refreshTokens.clear(user);
            userRepository.save(user);
            throw new UnauthorizedException(MessageConstants.EMAIL_NOT_VERIFIED_LOGIN);
        }

        if (user.getRefreshTokenExpiry() == null
                || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            refreshTokens.clear(user);
            userRepository.save(user);
            throw new UnauthorizedException(MessageConstants.REFRESH_TOKEN_EXPIRED);
        }

        refreshTokens.rotate(user);
        user.setTradingAllowed(isTradingAllowedFor(user));
        userRepository.save(user);
        return authResponses.auth(user, null);
    }

    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        userRepository.findByRefreshToken(refreshToken).ifPresent(user -> {
            refreshTokens.clear(user);
            userRepository.save(user);
        });
    }
}
