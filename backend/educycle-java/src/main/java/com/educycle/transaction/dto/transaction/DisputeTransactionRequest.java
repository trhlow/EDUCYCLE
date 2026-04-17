package com.educycle.transaction.dto.transaction;

import jakarta.validation.constraints.Size;

public record DisputeTransactionRequest(
        @Size(max = 2000, message = "Lý do tối đa 2000 ký tự")
        String reason
) {}
