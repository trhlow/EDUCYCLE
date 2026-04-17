package com.educycle.shared.dto.common;

import java.time.Instant;

public record PublicHealthResponse(
        String status,
        String service,
        Instant timestamp
) {}
