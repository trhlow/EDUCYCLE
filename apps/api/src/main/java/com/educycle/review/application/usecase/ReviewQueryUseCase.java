package com.educycle.review.application.usecase;

import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.review.application.support.ReviewResponseMapper;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewQueryUseCase {

    private final ReviewRepository reviewRepository;
    private final ReviewResponseMapper mapper;

    public ReviewResponse getById(UUID id) {
        return reviewRepository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá"));
    }

    public List<ReviewResponse> getAll() {
        return reviewRepository.findAllWithUser()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ReviewResponse> getByProductId(UUID productId) {
        return reviewRepository.findByProductId(productId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ReviewResponse> getByTargetUserId(UUID userId) {
        return reviewRepository.findByTargetUserId(userId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
