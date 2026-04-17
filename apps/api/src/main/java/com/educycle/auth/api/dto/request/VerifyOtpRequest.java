package com.educycle.auth.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerifyOtpRequest(
        @NotBlank(message = "Email là bắt buộc") @Email(message = "Email không đúng định dạng") String email,
        @NotBlank(message = "Mã OTP là bắt buộc") String otp
) {}
