package com.educycle.dto.transaction;

/**
 * Hủy giao dịch (buyer hoặc seller, tùy trạng thái) — lý do tuỳ chọn.
 */
public record CancelTransactionRequest(String reason) {}
