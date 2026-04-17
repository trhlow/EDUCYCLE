package com.educycle.transaction.api.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ChatMessage(
        @NotBlank String transactionId,
        @NotBlank String content
) {}
