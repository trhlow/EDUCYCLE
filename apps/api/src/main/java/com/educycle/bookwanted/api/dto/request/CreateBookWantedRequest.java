package com.educycle.bookwanted.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBookWantedRequest(
        @NotBlank @Size(max = 300) String title,
        @Size(max = 8000) String description,
        @Size(max = 150) String category
) {}
