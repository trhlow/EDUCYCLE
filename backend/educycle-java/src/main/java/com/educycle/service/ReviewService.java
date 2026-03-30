package com.educycle.service;

import com.educycle.dto.review.*;
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
