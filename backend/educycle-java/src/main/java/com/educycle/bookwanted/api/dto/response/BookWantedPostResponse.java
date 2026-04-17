package com.educycle.bookwanted.api.dto.response;

import java.time.Instant;
import java.util.UUID;

public record BookWantedPostResponse(
        UUID id,
        String title,
        String description,
        String category,
        String status,
        Instant createdAt,
        Instant updatedAt,
        UUID requesterUserId,
        String requesterMaskedUsername
) {}
