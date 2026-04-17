package com.educycle.wishlist.api.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Shape aligned with frontend wishlist card (localStorage / WishlistContext).
 */
public record WishlistCardResponse(
        UUID id,
        String name,
        BigDecimal price,
        String imageUrl,
        String category,
        String seller,
        double rating,
        int reviews
) {}
