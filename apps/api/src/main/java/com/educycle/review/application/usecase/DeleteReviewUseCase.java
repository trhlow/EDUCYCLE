package com.educycle.review.application.usecase;

import com.educycle.review.domain.Review;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DeleteReviewUseCase {

    private final ReviewRepository reviewRepository;

    public void delete(UUID id, UUID userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá"));

        if (review.getUser() == null || !review.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Bạn chỉ có thể xóa đánh giá của mình");
        }

        reviewRepository.delete(review);
    }
}
