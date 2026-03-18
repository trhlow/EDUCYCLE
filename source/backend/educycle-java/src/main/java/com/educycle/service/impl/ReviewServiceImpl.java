package com.educycle.service.impl;

import com.educycle.dto.review.CreateReviewRequest;
import com.educycle.dto.review.ReviewResponse;
import com.educycle.exception.NotFoundException;
import com.educycle.exception.UnauthorizedException;
import com.educycle.model.Product;
import com.educycle.model.Review;
import com.educycle.model.User;
import com.educycle.repository.ProductRepository;
import com.educycle.repository.ReviewRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static com.educycle.util.PrivacyHelper.maskUsername;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository  reviewRepository;
    private final UserRepository    userRepository;
    private final ProductRepository productRepository;

    @Override
    public ReviewResponse create(CreateReviewRequest request, UUID userId) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Product product = null;
        if (request.productId() != null) {
            product = productRepository.findById(request.productId())
                    .orElseThrow(() -> new NotFoundException("Product not found"));
        }

        User targetUser = null;
        if (request.targetUserId() != null) {
            targetUser = userRepository.findById(request.targetUserId())
                    .orElseThrow(() -> new NotFoundException("Target user not found"));
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
        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getById(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review with id '" + id + "' not found"));
        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAll() {
        return reviewRepository.findAllWithUser()
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getByProductId(UUID productId) {
        return reviewRepository.findByProductId(productId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getByTargetUserId(UUID userId) {
        return reviewRepository.findByTargetUserId(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public void delete(UUID id, UUID userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Review with id '" + id + "' not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse mapToResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getUser().getId(),
                maskUsername(r.getUser().getUsername()),
                maskUsername(r.getUser().getUsername()),
                r.getProduct() != null  ? r.getProduct().getId()     : null,
                r.getTargetUser() != null ? r.getTargetUser().getId() : null,
                r.getTransactionId(),
                r.getRating(),
                r.getContent(),
                r.getCreatedAt()
        );
    }

}
