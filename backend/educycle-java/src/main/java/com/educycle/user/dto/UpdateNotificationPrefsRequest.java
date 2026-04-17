package com.educycle.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPrefsRequest(
        @NotNull Boolean notifyProductModeration,
        @NotNull Boolean notifyTransactions,
        @NotNull Boolean notifyMessages
) {}
