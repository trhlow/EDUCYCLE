package com.educycle.service;

import com.educycle.dto.product.*;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse create(CreateProductRequest request, UUID userId);

    ProductResponse getById(UUID id);

    List<ProductResponse> getAll();

    List<ProductResponse> getAllForAdmin();

    List<ProductResponse> getPending();

    List<ProductResponse> getMyProducts(UUID userId);

    ProductResponse update(UUID id, UpdateProductRequest request, UUID userId);

    void delete(UUID id, UUID userId);

    ProductResponse approve(UUID id);

    ProductResponse reject(UUID id);
}
