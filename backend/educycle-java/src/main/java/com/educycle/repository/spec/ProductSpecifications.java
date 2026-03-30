package com.educycle.repository.spec;

import com.educycle.enums.ProductStatus;
import com.educycle.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Truy vấn danh mục công khai (APPROVED) với lọc server-side.
 */
public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    /**
     * Escape ký tự đặc biệt LIKE (%, _, \) — dùng với {@code cb.like(..., '\\')}.
     */
    public static String escapeLikePattern(String raw) {
        if (raw == null) {
            return "";
        }
        return raw
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }

    public static Specification<Product> publicCatalog(
            String q,
            String category,
            BigDecimal priceMin,
            BigDecimal priceMax) {

        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.equal(root.get("status"), ProductStatus.APPROVED));

            if (q != null && !q.isBlank()) {
                String term = "%" + escapeLikePattern(q.trim()).toLowerCase(Locale.ROOT) + "%";
                var nameLike = cb.like(cb.lower(root.get("name")), term, '\\');
                var descExpr = cb.coalesce(root.get("description"), cb.literal(""));
                var descLike = cb.like(cb.lower(descExpr), term, '\\');
                p.add(cb.or(nameLike, descLike));
            }

            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category.trim())) {
                p.add(cb.equal(root.get("category"), category.trim()));
            }

            if (priceMin != null) {
                p.add(cb.greaterThanOrEqualTo(root.get("price"), priceMin));
            }
            if (priceMax != null) {
                p.add(cb.lessThanOrEqualTo(root.get("price"), priceMax));
            }

            return cb.and(p.toArray(Predicate[]::new));
        };
    }
}
