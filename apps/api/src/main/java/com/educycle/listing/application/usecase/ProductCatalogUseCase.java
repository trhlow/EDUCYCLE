package com.educycle.listing.application.usecase;

import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.application.support.ProductPageMapper;
import com.educycle.listing.application.support.ProductResponseMapper;
import com.educycle.listing.domain.Product;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.listing.infrastructure.persistence.ProductSpecifications;
import com.educycle.review.domain.Review;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.shared.dto.common.PageResponse;
import com.educycle.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductCatalogUseCase {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final ProductPageMapper productPageMapper;
    private final ProductResponseMapper productResponseMapper;

    public ProductResponse getById(UUID id) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));
        List<Review> reviews = reviewRepository.findByProductId(id);
        return productResponseMapper.toResponse(product, reviews);
    }

    public PageResponse<ProductResponse> getAll(
            Pageable pageable,
            String q,
            String category,
            BigDecimal priceMin,
            BigDecimal priceMax) {

        Specification<Product> spec = ProductSpecifications.publicCatalog(q, category, priceMin, priceMax);
        Page<Product> page = productRepository.findAll(spec, pageable);
        return productPageMapper.page(page);
    }

    public List<ProductResponse> getAllForAdmin() {
        return productPageMapper.list(productRepository.findAllWithUser());
    }

    public List<ProductResponse> getPending() {
        return productPageMapper.list(productRepository.findByStatusWithUser(ProductStatus.PENDING));
    }

    public PageResponse<ProductResponse> getMyProducts(UUID userId, Pageable pageable) {
        return productPageMapper.page(productRepository.findByUser_Id(userId, pageable));
    }
}
