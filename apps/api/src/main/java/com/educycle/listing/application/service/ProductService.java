package com.educycle.listing.application.service;

import com.educycle.shared.dto.common.PageResponse;
import com.educycle.listing.api.dto.request.AdminRejectProductRequest;
import com.educycle.listing.api.dto.request.CreateProductRequest;
import com.educycle.listing.api.dto.request.UpdateProductRequest;
import com.educycle.listing.api.dto.response.ProductResponse;

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

    PageResponse<ProductResponse> getAll(
            int page,
            int size,
            String direction,
            String q,
            String category,
            BigDecimal priceMin,
            BigDecimal priceMax,
            String sort);

    List<ProductResponse> getAllForAdmin();

    List<ProductResponse> getPending();

    PageResponse<ProductResponse> getMyProducts(UUID userId, Pageable pageable);

    PageResponse<ProductResponse> getMyProducts(UUID userId, int page, int size, String direction);

    ProductResponse update(UUID id, UpdateProductRequest request, UUID userId);

    void delete(UUID id, UUID userId);

    ProductResponse approve(UUID id);

    ProductResponse reject(UUID id, AdminRejectProductRequest request);
}
