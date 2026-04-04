package com.educycle.dto.bookwanted;

import java.time.Instant;
import java.util.UUID;

public record BookWantedInquiryResponse(
        UUID id,
        UUID postId,
        String postTitle,
        UUID requesterUserId,
        String requesterMaskedUsername,
        UUID responderUserId,
        String responderMaskedUsername,
        Instant createdAt
) {}
