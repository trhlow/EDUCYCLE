package com.educycle.transaction.api.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Hủy giao dịch (buyer hoặc seller, tùy trạng thái) — lý do tuỳ chọn.
 */
public record CancelTransactionRequest(
        @Size(max = 2000, message = "Lý do hủy tối đa 2000 ký tự")
        String reason
) {}
