package com.educycle.dto.transaction;

import jakarta.validation.constraints.NotBlank;

public record TransactionVerifyOtpRequest(@NotBlank String otp) {}
