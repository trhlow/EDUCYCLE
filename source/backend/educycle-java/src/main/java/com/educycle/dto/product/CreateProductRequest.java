package com.educycle.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
        @NotBlank(message = "Tên sản phẩm là bắt buộc") String name,
        String description,

        @NotNull(message = "Giá là bắt buộc")
        @DecimalMin(value = "0.0", inclusive = false, message = "Giá phải lớn hơn 0")
        BigDecimal price,

        String imageUrl,
        List<String> imageUrls,
        String category,
        String condition,
        String contactNote,
        Integer categoryId
) {}
