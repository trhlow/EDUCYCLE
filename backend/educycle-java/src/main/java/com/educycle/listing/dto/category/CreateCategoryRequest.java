package com.educycle.listing.dto.category;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank(message = "Tên danh mục là bắt buộc") String name
) {}
