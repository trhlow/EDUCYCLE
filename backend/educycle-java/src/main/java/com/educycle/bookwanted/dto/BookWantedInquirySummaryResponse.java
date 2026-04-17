package com.educycle.bookwanted.dto;

import java.time.Instant;
import java.util.UUID;

/** Một người liên hệ trên tin tìm sách — dùng cho chủ tin xem danh sách. */
public record BookWantedInquirySummaryResponse(
        UUID inquiryId,
        UUID responderUserId,
        String responderMaskedUsername,
        Instant createdAt
) {}
