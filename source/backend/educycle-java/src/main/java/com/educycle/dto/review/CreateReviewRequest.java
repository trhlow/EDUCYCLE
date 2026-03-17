package com.educycle.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateReviewRequest(
        UUID productId,
        UUID targetUserId,
        UUID transactionId,

        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        int rating,

        @NotBlank(message = "Review content is required") String content
) {}
