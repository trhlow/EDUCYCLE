package com.educycle.listing.application.service;

import com.educycle.listing.api.dto.request.CreateCategoryRequest;
import com.educycle.listing.api.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse create(CreateCategoryRequest request);
    CategoryResponse getById(Integer id);
    List<CategoryResponse> getAll();
    CategoryResponse update(Integer id, CreateCategoryRequest request);
    void delete(Integer id);
}
