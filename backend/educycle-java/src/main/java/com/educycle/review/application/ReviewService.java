package com.educycle.review.application;

import com.educycle.review.dto.*;
import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewResponse create(CreateReviewRequest request, UUID userId);
    ReviewResponse getById(UUID id);
    List<ReviewResponse> getAll();
    List<ReviewResponse> getByProductId(UUID productId);
    List<ReviewResponse> getByTargetUserId(UUID userId);
    void delete(UUID id, UUID userId);
}
