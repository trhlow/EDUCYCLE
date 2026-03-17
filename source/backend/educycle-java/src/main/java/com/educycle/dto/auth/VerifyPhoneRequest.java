package com.educycle.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyPhoneRequest(
        @NotBlank(message = "Phone is required") String phone
) {}
