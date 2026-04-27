package com.educycle.auth.application.support;

import com.educycle.auth.api.dto.response.AuthResponse;
import com.educycle.shared.security.JwtTokenProvider;
import com.educycle.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthResponses {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * @param plainRefreshToken token returned to the client (never the DB hash)
     */
    public AuthResponse auth(User user, String message, String plainRefreshToken) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                jwtTokenProvider.generateToken(user),
                user.getRole().name(),
                user.isEmailVerified(),
                message,
                plainRefreshToken,
                user.getRefreshTokenExpiry()
        );
    }
}
