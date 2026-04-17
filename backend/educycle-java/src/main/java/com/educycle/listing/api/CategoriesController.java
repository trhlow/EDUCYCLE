package com.educycle.listing.api;

import com.educycle.listing.dto.category.CategoryResponse;
import com.educycle.listing.dto.category.CreateCategoryRequest;
import com.educycle.listing.application.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Maps C# CategoriesController.cs
 *
 * Note: GET endpoints are public (no @PreAuthorize).
 * Write endpoints require ADMIN role.
 * CategoryId is Integer, not UUID — matches C# int constraint.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoriesController {

    private final CategoryService categoryService;

    // POST /api/categories  [Authorize(Roles="Admin")]
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return ResponseEntity.ok(categoryService.create(request));
    }

    // GET /api/categories  [AllowAnonymous]
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    // GET /api/categories/{id}  [AllowAnonymous]
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    // PUT /api/categories/{id}  [Authorize(Roles="Admin")]
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody CreateCategoryRequest request) {

        return ResponseEntity.ok(categoryService.update(id, request));
    }

    // DELETE /api/categories/{id}  [Authorize(Roles="Admin")]
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
