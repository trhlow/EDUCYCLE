package com.educycle.dto.product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        List<String> imageUrls,
        String category,
        String categoryName,
        Integer categoryId,
        String condition,
        String contactNote,
        UUID userId,
        UUID sellerId,
        String sellerName,
        String status,
        double averageRating,
        int reviewCount,
        Instant createdAt,
        String rejectReason
) {}
