package com.educycle.listing.application.support;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Locale;

public final class ProductPageables {

    private ProductPageables() {
    }

    public static Pageable publicCatalog(int page, int size, String sort, String direction) {
        return PageRequest.of(safePage(page), safeSize(size), publicCatalogSort(sort, direction));
    }

    public static Pageable ownerList(int page, int size, String direction) {
        Sort sort = "asc".equalsIgnoreCase(direction)
                ? Sort.by("createdAt").ascending()
                : Sort.by("createdAt").descending();
        return PageRequest.of(safePage(page), safeSize(size), sort);
    }

    private static Sort publicCatalogSort(String sort, String direction) {
        String normalizedSort = sort == null ? "newest" : sort.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedSort) {
            case "price-low" -> Sort.by("price").ascending().and(Sort.by("createdAt").descending());
            case "price-high" -> Sort.by("price").descending().and(Sort.by("createdAt").descending());
            case "rating" -> Sort.by("createdAt").descending();
            default -> "asc".equalsIgnoreCase(direction)
                    ? Sort.by("createdAt").ascending()
                    : Sort.by("createdAt").descending();
        };
    }

    private static int safePage(int page) {
        return Math.max(page, 0);
    }

    private static int safeSize(int size) {
        return Math.min(Math.max(size, 1), 100);
    }
}
