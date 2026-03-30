package com.educycle.dto.user;

import java.util.List;
import java.util.UUID;

public record PublicUserProfileResponse(
        UUID userId,
        String username,
        String bio,
        String avatar,
        double averageRating,
        long reviewCount,
        List<PublicReviewSnippet> recentReviews
) {}
