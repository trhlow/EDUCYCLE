package com.educycle.bookwanted.api.dto.response;

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
