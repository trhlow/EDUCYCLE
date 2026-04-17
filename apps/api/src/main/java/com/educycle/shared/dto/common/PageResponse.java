package com.educycle.shared.dto.common;

import java.util.List;

/**
 * JSON-friendly page wrapper (Spring {@code Page} is awkward for API clients).
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {}
