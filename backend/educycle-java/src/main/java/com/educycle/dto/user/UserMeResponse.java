package com.educycle.dto.user;

import java.time.Instant;
import java.util.UUID;

public record UserMeResponse(
        UUID userId,
        String username,
        String email,
        String role,
        boolean emailVerified,
        boolean phoneVerified,
        String phone,
        String bio,
        String avatar,
        boolean notifyProductModeration,
        boolean notifyTransactions,
        boolean notifyMessages,
        Instant transactionRulesAcceptedAt
) {}
