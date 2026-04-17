package com.educycle.auth.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record VerifyPhoneRequest(
        @NotBlank(message = "Số điện thoại là bắt buộc") String phone
) {}
