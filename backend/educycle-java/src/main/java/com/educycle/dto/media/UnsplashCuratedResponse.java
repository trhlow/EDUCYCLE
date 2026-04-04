package com.educycle.dto.media;

import java.time.Instant;
import java.util.List;

public record UnsplashCuratedResponse(
        List<UnsplashImageResponse> items,
        Instant fetchedAt,
        long cacheTtlSeconds
) {}
