package com.educycle.review.application.support;

import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.review.domain.Review;
import org.springframework.stereotype.Component;

import static com.educycle.shared.util.PrivacyHelper.maskUsername;

@Component
public class ReviewResponseMapper {

    public ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getId(),
                maskUsername(review.getUser().getUsername()),
                maskUsername(review.getUser().getUsername()),
                review.getProduct() != null ? review.getProduct().getId() : null,
                review.getTargetUser() != null ? review.getTargetUser().getId() : null,
                review.getTransactionId(),
                review.getRating(),
                review.getContent(),
                review.getCreatedAt()
        );
    }
}
