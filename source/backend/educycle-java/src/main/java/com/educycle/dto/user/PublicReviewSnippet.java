package com.educycle.dto.user;

import java.time.Instant;
import java.util.UUID;

public record PublicReviewSnippet(
        UUID id,
        String reviewerUsername,
        int rating,
        String content,
        Instant createdAt
) {}
