package com.educycle.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequest(
        @NotBlank(message = "Product name is required") String name,
        String description,

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal price,

        String imageUrl,
        List<String> imageUrls,
        String category,
        String condition,
        String contactNote,
        Integer categoryId
) {}
