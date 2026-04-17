package com.educycle.transaction.dto.message;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(@NotBlank String content) {}
