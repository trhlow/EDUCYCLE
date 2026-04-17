package com.educycle.bookwanted.dto;

import java.time.Instant;
import java.util.UUID;

public record BookWantedInquiryMessageResponse(
        UUID id,
        UUID inquiryId,
        UUID senderId,
        String senderName,
        String content,
        Instant createdAt
) {}
