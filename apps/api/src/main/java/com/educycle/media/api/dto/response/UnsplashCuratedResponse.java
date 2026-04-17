package com.educycle.media.api.dto.response;

import java.time.Instant;
import java.util.List;

public record UnsplashCuratedResponse(
        List<UnsplashImageResponse> items,
        Instant fetchedAt,
        long cacheTtlSeconds
) {}
