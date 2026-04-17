package com.educycle.transaction.dto.message;

import jakarta.validation.constraints.NotBlank;

public record ChatMessage(
        @NotBlank String transactionId,
        @NotBlank String content
) {}
