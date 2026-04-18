package com.educycle.auth.application.support;

import com.educycle.shared.security.JwtTokenProvider;
import com.educycle.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuthRefreshTokens {

    private final JwtTokenProvider jwtTokenProvider;

    public void startNewChain(User user) {
        user.setRefreshTokenFamily(UUID.randomUUID());
        user.setRefreshToken(jwtTokenProvider.generateRefreshToken());
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
    }

    public void rotate(User user) {
        if (user.getRefreshTokenFamily() == null) {
            user.setRefreshTokenFamily(UUID.randomUUID());
        }
        user.setRefreshToken(jwtTokenProvider.generateRefreshToken());
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
    }

    public void clear(User user) {
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        user.setRefreshTokenFamily(null);
    }
}
