package com.educycle.listing.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
        @NotBlank(message = "Tên sản phẩm là bắt buộc") String name,
        String description,

        /** 0 = giá liên hệ (FE gửi khi priceType=contact); &gt; 0 = giá cố định */
        @NotNull(message = "Giá là bắt buộc")
        @PositiveOrZero(message = "Giá không được âm")
        BigDecimal price,

        String imageUrl,
        List<String> imageUrls,
        String category,
        String condition,
        String contactNote,
        Integer categoryId
) {}
