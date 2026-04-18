package com.educycle.listing.api;

import com.educycle.shared.dto.common.PageResponse;
import com.educycle.listing.api.dto.request.AdminRejectProductRequest;
import com.educycle.listing.api.dto.request.CreateProductRequest;
import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.api.dto.request.UpdateProductRequest;
import com.educycle.listing.application.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    // GET /api/products  [AllowAnonymous] — phân trang + lọc server: q, category, priceMin, priceMax, sort
    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal priceMin,
            @RequestParam(required = false) BigDecimal priceMax,
            @RequestParam(defaultValue = "newest") String sort) {

        return ResponseEntity.ok(productService.getAll(page, size, direction, q, category, priceMin, priceMax, sort));
    }

    // GET /api/products/mine  [Authorize]
    @GetMapping("/mine")
    public ResponseEntity<PageResponse<ProductResponse>> getMyProducts(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(productService.getMyProducts(UUID.fromString(userId), page, size, direction));
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
    public ResponseEntity<ProductResponse> reject(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) AdminRejectProductRequest request) {

        return ResponseEntity.ok(productService.reject(id, request));
    }
}
