package com.educycle.auth.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank(message = "Mã làm mới phiên là bắt buộc") String refreshToken
) {}
