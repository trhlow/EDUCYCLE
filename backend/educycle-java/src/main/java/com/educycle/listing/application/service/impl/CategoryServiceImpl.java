package com.educycle.listing.application.service.impl;

import com.educycle.listing.api.dto.response.CategoryResponse;
import com.educycle.listing.api.dto.request.CreateCategoryRequest;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.listing.domain.Category;
import com.educycle.listing.infrastructure.persistence.CategoryRepository;
import com.educycle.listing.application.service.CategoryService;
import com.educycle.shared.util.MessageConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Maps C# CategoryService.cs — straightforward CRUD, no changes needed.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse create(CreateCategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.CATEGORY_NOT_FOUND.formatted(id)));
        return mapToResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CategoryResponse update(Integer id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.CATEGORY_NOT_FOUND.formatted(id)));
        category.setName(request.name());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public void delete(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.CATEGORY_NOT_FOUND.formatted(id)));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName());
    }
}
