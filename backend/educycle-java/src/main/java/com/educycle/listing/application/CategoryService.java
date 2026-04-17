package com.educycle.listing.application;

import com.educycle.listing.dto.category.*;
import java.util.List;

public interface CategoryService {
    CategoryResponse create(CreateCategoryRequest request);
    CategoryResponse getById(Integer id);
    List<CategoryResponse> getAll();
    CategoryResponse update(Integer id, CreateCategoryRequest request);
    void delete(Integer id);
}
