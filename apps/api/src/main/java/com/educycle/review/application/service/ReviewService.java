package com.educycle.review.application.service;

import com.educycle.review.api.dto.request.*;
import com.educycle.review.api.dto.response.*;
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
