package com.educycle.controller;

import com.educycle.dto.product.CreateProductRequest;
import com.educycle.dto.product.ProductResponse;
import com.educycle.dto.product.UpdateProductRequest;
import com.educycle.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Maps C# ProductsController.cs
 *
 * Key differences:
 *  - [Authorize(Roles = "Admin")]    → @PreAuthorize("hasRole('ADMIN')")
 *  - [Authorize]                     → enforced by SecurityConfig (anyRequest().authenticated())
 *  - [HttpPatch("{id:guid}/approve")] → @PatchMapping("/{id}/approve")
 *  - Guid constraint                  → UUID path variable (Spring handles UUID parsing)
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductsController {

    private final ProductService productService;

    // POST /api/products  [Authorize]
    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateProductRequest request) {

        return ResponseEntity.ok(productService.create(request, UUID.fromString(userId)));
    }

    // GET /api/products  [AllowAnonymous]
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    // GET /api/products/mine  [Authorize]
    @GetMapping("/mine")
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(productService.getMyProducts(UUID.fromString(userId)));
    }

    // GET /api/products/pending  [Authorize(Roles="Admin")]
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getPending() {
        return ResponseEntity.ok(productService.getPending());
    }

    // GET /api/products/admin/all  [Authorize(Roles="Admin")]
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getAllForAdmin() {
        return ResponseEntity.ok(productService.getAllForAdmin());
    }

    // GET /api/products/{id}  [AllowAnonymous]
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    // PUT /api/products/{id}  [Authorize]
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateProductRequest request) {

        return ResponseEntity.ok(productService.update(id, request, UUID.fromString(userId)));
    }

    // DELETE /api/products/{id}  [Authorize]
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId) {

        productService.delete(id, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/products/{id}/approve  [Authorize(Roles="Admin")]
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.approve(id));
    }

    // PATCH /api/products/{id}/reject  [Authorize(Roles="Admin")]
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.reject(id));
    }
}
