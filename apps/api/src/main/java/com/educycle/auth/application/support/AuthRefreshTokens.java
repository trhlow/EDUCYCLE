package com.educycle.auth.application.support;

import com.educycle.shared.security.JwtTokenProvider;
import com.educycle.shared.security.RefreshTokenHasher;
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

    /**
     * @return plaintext refresh token (client-only); DB stores {@link RefreshTokenHasher#sha256Hex(String)}.
     */
    public String startNewChain(User user) {
        user.setRefreshTokenFamily(UUID.randomUUID());
        String plain = jwtTokenProvider.generateRefreshToken();
        user.setRefreshToken(RefreshTokenHasher.sha256Hex(plain));
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        return plain;
    }

    /**
     * @return plaintext refresh token (client-only); DB stores hash.
     */
    public String rotate(User user) {
        if (user.getRefreshTokenFamily() == null) {
            user.setRefreshTokenFamily(UUID.randomUUID());
        }
        String plain = jwtTokenProvider.generateRefreshToken();
        user.setRefreshToken(RefreshTokenHasher.sha256Hex(plain));
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        return plain;
    }

    public void clear(User user) {
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        user.setRefreshTokenFamily(null);
    }
}
