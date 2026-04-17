package com.educycle.transaction.dto.message;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID transactionId,
        UUID senderId,
        String senderName,
        String content,
        Instant createdAt
) {}
