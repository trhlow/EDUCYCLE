package com.educycle.user.dto;

import java.time.Instant;
import java.util.UUID;

public record PublicReviewSnippet(
        UUID id,
        String reviewerUsername,
        int rating,
        String content,
        Instant createdAt
) {}
