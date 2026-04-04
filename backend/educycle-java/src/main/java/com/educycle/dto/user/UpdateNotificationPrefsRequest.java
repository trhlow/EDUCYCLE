package com.educycle.dto.user;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPrefsRequest(
        @NotNull Boolean notifyProductModeration,
        @NotNull Boolean notifyTransactions,
        @NotNull Boolean notifyMessages
) {}
