package com.educycle.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * @param token             id_token / access_token (Microsoft, Google implicit)
 * @param authorizationCode Google auth-code + PKCE (khuyến nghị) — đổi server-side
 * @param redirectUri       thường {@code postmessage} với popup GIS
 */
public record SocialLoginRequest(
        @NotBlank String provider,
        String email,
        String token,
        String authorizationCode,
        String redirectUri
) {}
