package com.educycle.listing.application.service.impl;

import com.educycle.listing.api.dto.request.AdminRejectProductRequest;
import com.educycle.listing.api.dto.request.CreateProductRequest;
import com.educycle.listing.api.dto.request.UpdateProductRequest;
import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.application.service.ProductService;
import com.educycle.listing.application.support.ProductPageables;
import com.educycle.listing.application.usecase.ProductCatalogUseCase;
import com.educycle.listing.application.usecase.ProductModerationUseCase;
import com.educycle.listing.application.usecase.ProductOwnerUseCase;
import com.educycle.shared.dto.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductOwnerUseCase ownerUseCase;
    private final ProductCatalogUseCase catalogUseCase;
    private final ProductModerationUseCase moderationUseCase;

    @Override
    public ProductResponse create(CreateProductRequest request, UUID userId) {
        return ownerUseCase.create(request, userId);
    }

    @Override
    public ProductResponse getById(UUID id) {
        return catalogUseCase.getById(id);
    }

    @Override
    public PageResponse<ProductResponse> getAll(
            Pageable pageable,
            String q,
            String category,
            BigDecimal priceMin,
            BigDecimal priceMax) {
        return catalogUseCase.getAll(pageable, q, category, priceMin, priceMax);
    }

    @Override
    public PageResponse<ProductResponse> getAll(
            int page,
            int size,
            String direction,
            String q,
            String category,
            BigDecimal priceMin,
            BigDecimal priceMax,
            String sort) {
        return catalogUseCase.getAll(
                ProductPageables.publicCatalog(page, size, sort, direction),
                q,
                category,
                priceMin,
                priceMax);
    }

    @Override
    public List<ProductResponse> getAllForAdmin() {
        return catalogUseCase.getAllForAdmin();
    }

    @Override
    public PageResponse<ProductResponse> getAllForAdmin(int page, int size, String direction) {
        return catalogUseCase.getAllForAdmin(ProductPageables.ownerList(page, size, direction));
    }

    @Override
    public List<ProductResponse> getPending() {
        return catalogUseCase.getPending();
    }

    @Override
    public PageResponse<ProductResponse> getPending(int page, int size, String direction) {
        return catalogUseCase.getPending(ProductPageables.ownerList(page, size, direction));
    }

    @Override
    public PageResponse<ProductResponse> getMyProducts(UUID userId, Pageable pageable) {
        return catalogUseCase.getMyProducts(userId, pageable);
    }

    @Override
    public PageResponse<ProductResponse> getMyProducts(UUID userId, int page, int size, String direction) {
        return catalogUseCase.getMyProducts(userId, ProductPageables.ownerList(page, size, direction));
    }

    @Override
    public ProductResponse update(UUID id, UpdateProductRequest request, UUID userId) {
        return ownerUseCase.update(id, request, userId);
    }

    @Override
    public void delete(UUID id, UUID userId) {
        ownerUseCase.delete(id, userId);
    }

    @Override
    public ProductResponse approve(UUID id) {
        return moderationUseCase.approve(id);
    }

    @Override
    public ProductResponse reject(UUID id, AdminRejectProductRequest request) {
        return moderationUseCase.reject(id, request);
    }
}
