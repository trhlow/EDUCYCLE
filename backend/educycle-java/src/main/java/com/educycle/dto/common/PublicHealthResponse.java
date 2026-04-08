package com.educycle.dto.common;

import java.time.Instant;

public record PublicHealthResponse(
        String status,
        String service,
        Instant timestamp
) {}
