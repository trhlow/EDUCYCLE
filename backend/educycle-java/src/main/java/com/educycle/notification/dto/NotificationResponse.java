package com.educycle.notification.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        String title,
        String message,
        UUID relatedId,
        boolean read,
        Instant createdAt
) {}
