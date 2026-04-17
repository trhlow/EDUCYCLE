package com.educycle.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateReviewRequest(
        UUID productId,
        UUID targetUserId,
        UUID transactionId,

        @Min(value = 1, message = "Đánh giá tối thiểu là 1 sao")
        @Max(value = 5, message = "Đánh giá tối đa là 5 sao")
        int rating,

        @NotBlank(message = "Nội dung đánh giá là bắt buộc") String content
) {}
