package com.educycle.transaction.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateTransactionStatusRequest(
        @NotBlank String status
) {}
