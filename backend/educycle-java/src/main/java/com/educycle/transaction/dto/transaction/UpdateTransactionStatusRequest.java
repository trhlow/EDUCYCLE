package com.educycle.transaction.dto.transaction;

import jakarta.validation.constraints.NotBlank;

public record UpdateTransactionStatusRequest(
        @NotBlank String status
) {}
