package com.educycle.listing.application;

import com.educycle.shared.dto.common.PageResponse;
import com.educycle.listing.dto.product.*;

import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse create(CreateProductRequest request, UUID userId);

    ProductResponse getById(UUID id);

    PageResponse<ProductResponse> getAll(
            Pageable pageable,
            String q,
            String category,
            BigDecimal priceMin,
            BigDecimal priceMax);

    List<ProductResponse> getAllForAdmin();

    List<ProductResponse> getPending();

    PageResponse<ProductResponse> getMyProducts(UUID userId, Pageable pageable);

    ProductResponse update(UUID id, UpdateProductRequest request, UUID userId);

    void delete(UUID id, UUID userId);

    ProductResponse approve(UUID id);

    ProductResponse reject(UUID id, AdminRejectProductRequest request);
}
