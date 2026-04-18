package com.educycle.listing.application.support;

import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.domain.Product;
import com.educycle.review.domain.Review;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

import static com.educycle.shared.util.PrivacyHelper.maskUsername;

@Component
@RequiredArgsConstructor
public class ProductResponseMapper {

    private final ProductImages productImages;

    public ProductResponse toResponse(Product product, List<Review> reviews) {
        List<String> imageUrlList = productImages.deserialize(product.getImageUrls());
        double avgRating = reviews.isEmpty() ? 0.0
                : Math.round(reviews.stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0) * 10.0) / 10.0;

        UUID userId = product.getUser() != null ? product.getUser().getId() : null;
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                imageUrlList,
                product.getCategory(),
                product.getCategory(),
                product.getCategoryRef() != null ? product.getCategoryRef().getId() : null,
                product.getCondition(),
                product.getContactNote(),
                userId,
                userId,
                maskUsername(product.getUser() != null ? product.getUser().getUsername() : null),
                product.getStatus().name(),
                avgRating,
                reviews.size(),
                product.getCreatedAt(),
                product.getRejectReason()
        );
    }
}
