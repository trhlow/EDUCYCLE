package com.educycle.dto.auth;

import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String username,
        String email,
        String token,
        String role,
        boolean emailVerified,
        String message
) {}
