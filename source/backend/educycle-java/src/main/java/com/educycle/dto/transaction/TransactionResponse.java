package com.educycle.dto.transaction;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        TransactionUserDto buyer,
        TransactionUserDto seller,
        TransactionProductDto product,
        BigDecimal amount,
        String status,
        boolean buyerConfirmed,
        boolean sellerConfirmed,
        Instant createdAt,
        Instant updatedAt
) {
    public record TransactionUserDto(String id, String username, String email) {}

    // FIX: added description and category — FE accesses both fields in TransactionDetailPage
    public record TransactionProductDto(
            String id,
            String name,
            BigDecimal price,
            String imageUrl,
            String description,
            String category
    ) {}
}
