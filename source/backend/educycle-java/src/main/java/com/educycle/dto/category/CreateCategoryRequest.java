package com.educycle.dto.category;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank(message = "Category name is required") String name
) {}
