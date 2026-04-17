package com.educycle.transaction.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * {@code amount} = 0 khi sản phẩm &quot;giá liên hệ&quot; (FE gửi 0); &gt; 0 khi có giá cố định.
 */
public record CreateTransactionRequest(
        @NotNull UUID productId,
        @NotNull UUID sellerId,
        @NotNull @PositiveOrZero BigDecimal amount
) {}
