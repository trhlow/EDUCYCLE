package com.educycle.review.application.usecase;

import com.educycle.listing.domain.Product;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.review.api.dto.request.CreateReviewRequest;
import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.review.application.support.ReviewResponseMapper;
import com.educycle.review.domain.Review;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CreateReviewUseCase {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewResponseMapper mapper;

    public ReviewResponse create(CreateReviewRequest request, UUID userId) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        Product product = null;
        if (request.productId() != null) {
            product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));
        }

        User targetUser = null;
        if (request.targetUserId() != null) {
            targetUser = userRepository.findById(request.targetUserId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng được đánh giá"));
        }

        Review review = Review.builder()
                .user(reviewer)
                .product(product)
                .targetUser(targetUser)
                .transactionId(request.transactionId())
                .rating(request.rating())
                .content(request.content())
                .build();

        reviewRepository.save(review);
        return mapper.toResponse(review);
    }
}
