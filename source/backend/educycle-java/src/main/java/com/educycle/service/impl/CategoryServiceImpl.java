package com.educycle.service.impl;

import com.educycle.dto.category.CategoryResponse;
import com.educycle.dto.category.CreateCategoryRequest;
import com.educycle.exception.NotFoundException;
import com.educycle.model.Category;
import com.educycle.repository.CategoryRepository;
import com.educycle.service.CategoryService;
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
                .orElseThrow(() -> new NotFoundException("Không tìm thấy danh mục"));
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
                .orElseThrow(() -> new NotFoundException("Không tìm thấy danh mục"));
        category.setName(request.name());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    @Override
    public void delete(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy danh mục"));
        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName());
    }
}
