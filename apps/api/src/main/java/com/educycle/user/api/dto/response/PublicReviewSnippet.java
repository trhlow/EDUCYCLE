package com.educycle.user.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record PublicReviewSnippet(
        UUID id,
        String reviewerUsername,
        int rating,
        String content,
        Instant createdAt
) {}
