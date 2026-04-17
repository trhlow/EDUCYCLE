package com.educycle.admin.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Admin list row for registered users — replaces untyped {@code Map<String, Object>} on {@code GET /api/admin/users}.
 */
public record AdminUserSummaryResponse(
        UUID id,
        String username,
        String email,
        String role,
        Instant createdAt
) {}
