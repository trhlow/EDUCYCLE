package com.educycle.transaction.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TransactionVerifyOtpRequest(@NotBlank String otp) {}
