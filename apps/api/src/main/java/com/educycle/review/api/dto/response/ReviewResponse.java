package com.educycle.review.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID userId,
        String username,
        String reviewerName,
        UUID productId,
        UUID targetUserId,
        UUID transactionId,
        int rating,
        String content,
        Instant createdAt
) {}
