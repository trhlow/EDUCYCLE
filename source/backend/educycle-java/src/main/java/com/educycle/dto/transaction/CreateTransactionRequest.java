package com.educycle.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateTransactionRequest(
        @NotNull UUID productId,
        @NotNull UUID sellerId,
        @NotNull @DecimalMin("0.01") BigDecimal amount
) {}
