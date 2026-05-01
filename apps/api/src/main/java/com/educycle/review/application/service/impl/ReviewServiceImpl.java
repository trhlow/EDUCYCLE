package com.educycle.review.application.service.impl;

import com.educycle.review.api.dto.request.CreateReviewRequest;
import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.review.application.service.ReviewService;
import com.educycle.review.application.usecase.CreateReviewUseCase;
import com.educycle.review.application.usecase.DeleteReviewUseCase;
import com.educycle.review.application.usecase.ReviewQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final CreateReviewUseCase createReviewUseCase;
    private final ReviewQueryUseCase reviewQueryUseCase;
    private final DeleteReviewUseCase deleteReviewUseCase;

    @Override
    public ReviewResponse create(CreateReviewRequest request, UUID userId) {
        return createReviewUseCase.create(request, userId);
    }

    @Override
    public ReviewResponse getById(UUID id) {
        return reviewQueryUseCase.getById(id);
    }

    @Override
    public List<ReviewResponse> getAll() {
        return reviewQueryUseCase.getAll();
    }

    @Override
    public List<ReviewResponse> getByProductId(UUID productId) {
        return reviewQueryUseCase.getByProductId(productId);
    }

    @Override
    public List<ReviewResponse> getByTransactionId(UUID transactionId) {
        return reviewQueryUseCase.getByTransactionId(transactionId);
    }

    @Override
    public List<ReviewResponse> getByTargetUserId(UUID userId) {
        return reviewQueryUseCase.getByTargetUserId(userId);
    }

    @Override
    public void delete(UUID id, UUID userId) {
        deleteReviewUseCase.delete(id, userId);
    }
}
