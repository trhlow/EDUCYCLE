package com.educycle.listing.application.support;

import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.domain.Product;
import com.educycle.review.domain.Review;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.shared.dto.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductPageMapper {

    private final ReviewRepository reviewRepository;
    private final ProductResponseMapper productResponseMapper;

    public List<ProductResponse> list(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return List.of();
        }
        Set<UUID> ids = products.stream().map(Product::getId).collect(Collectors.toSet());
        Map<UUID, List<Review>> reviewMap = reviewRepository.findByProductIdIn(ids)
                .stream()
                .filter(r -> r.getProduct() != null)
                .collect(Collectors.groupingBy(r -> r.getProduct().getId()));

        return products.stream()
                .map(p -> productResponseMapper.toResponse(p, reviewMap.getOrDefault(p.getId(), List.of())))
                .toList();
    }

    public PageResponse<ProductResponse> page(Page<Product> page) {
        return new PageResponse<>(
                list(page.getContent()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }
}
