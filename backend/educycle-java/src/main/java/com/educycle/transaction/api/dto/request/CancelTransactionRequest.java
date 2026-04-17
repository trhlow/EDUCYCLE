package com.educycle.transaction.api.dto.request;

/**
 * Hủy giao dịch (buyer hoặc seller, tùy trạng thái) — lý do tuỳ chọn.
 */
public record CancelTransactionRequest(String reason) {}
