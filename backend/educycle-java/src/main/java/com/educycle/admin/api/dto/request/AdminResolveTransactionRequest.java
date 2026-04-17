package com.educycle.admin.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminResolveTransactionRequest(
        @NotBlank(message = "resolution là bắt buộc: COMPLETED hoặc CANCELLED")
        String resolution,

        @Size(max = 2000)
        String adminNote
) {}
