package com.educycle.review.api;

import com.educycle.review.api.dto.request.CreateReviewRequest;
import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.review.application.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Maps C# ReviewsController.cs
 *
 * [AllowAnonymous] endpoints → permitted in SecurityConfig (.requestMatchers("/api/reviews/**").permitAll())
 * [Authorize] endpoints      → default authenticated() rule from SecurityConfig
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewsController {

    private final ReviewService reviewService;

    // POST /api/reviews  [Authorize]
    @PostMapping
    public ResponseEntity<ReviewResponse> create(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateReviewRequest request) {

        return ResponseEntity.ok(reviewService.create(request, UUID.fromString(userId)));
    }

    // GET /api/reviews/{id}  [Authorize]
    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(reviewService.getById(id));
    }

    // GET /api/reviews  [AllowAnonymous]
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAll() {
        return ResponseEntity.ok(reviewService.getAll());
    }

    // GET /api/reviews/product/{productId}  [AllowAnonymous]
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(reviewService.getByProductId(productId));
    }

    // GET /api/reviews/transaction/{transactionId}  [AllowAnonymous]
    // In C# this called GetByProductIdAsync — kept same behavior
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<List<ReviewResponse>> getByTransaction(@PathVariable UUID transactionId) {
        return ResponseEntity.ok(reviewService.getByProductId(transactionId));
    }

    // GET /api/reviews/user/{userId}  [AllowAnonymous]
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewResponse>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(reviewService.getByTargetUserId(userId));
    }

    // DELETE /api/reviews/{id}  [Authorize]
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId) {

        reviewService.delete(id, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }
}
