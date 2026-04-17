package com.educycle.admin.api.dto.response;

import java.time.Instant;
import java.util.UUID;

/** Chi tiết user cho form sửa — chỉ ADMIN; email đầy đủ (không mask). */
public record AdminUserDetailResponse(
        UUID id,
        String username,
        String email,
        String role,
        boolean emailVerified,
        boolean tradingAllowed,
        Instant createdAt
) {}
