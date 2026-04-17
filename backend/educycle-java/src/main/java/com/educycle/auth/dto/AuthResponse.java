package com.educycle.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String username,
        String email,
        String token,
        String role,
        boolean emailVerified,
        String message,
        String refreshToken,
        Instant refreshTokenExpiry
) {}
