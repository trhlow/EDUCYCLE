package com.educycle.dto.bookwanted;

import jakarta.validation.constraints.Size;

/**
 * Các trường null = không đổi. {@code status} chỉ nhận {@code CLOSED} để đóng tin.
 */
public record UpdateBookWantedRequest(
        @Size(max = 300) String title,
        @Size(max = 8000) String description,
        @Size(max = 150) String category,
        @Size(max = 20) String status
) {}
