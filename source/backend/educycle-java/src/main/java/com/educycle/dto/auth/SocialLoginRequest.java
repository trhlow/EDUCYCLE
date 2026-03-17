package com.educycle.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record SocialLoginRequest(
        @NotBlank String provider,
        String email,
        String token
) {}
