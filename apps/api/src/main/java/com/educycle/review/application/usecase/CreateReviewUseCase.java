package com.educycle.review.application.usecase;

import com.educycle.review.api.dto.request.CreateReviewRequest;
import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.review.application.support.ReviewResponseMapper;
import com.educycle.review.domain.Review;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ConflictException;
import com.educycle.shared.exception.ForbiddenException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
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
    private final TransactionRepository transactionRepository;
    private final ReviewResponseMapper mapper;

    public ReviewResponse create(CreateReviewRequest request, UUID userId) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        if (request.transactionId() == null) {
            throw new BadRequestException(MessageConstants.REVIEW_TRANSACTION_REQUIRED);
        }

        Transaction transaction = transactionRepository.findByIdWithDetails(request.transactionId())
                .orElseThrow(() -> new NotFoundException(
                        String.format(MessageConstants.TRANSACTION_NOT_FOUND, request.transactionId())));

        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
            throw new BadRequestException(MessageConstants.REVIEW_TRANSACTION_NOT_COMPLETED);
        }

        boolean reviewerIsBuyer = transaction.getBuyer().getId().equals(userId);
        boolean reviewerIsSeller = transaction.getSeller().getId().equals(userId);
        if (!reviewerIsBuyer && !reviewerIsSeller) {
            throw new ForbiddenException(MessageConstants.REVIEW_NOT_ALLOWED);
        }

        User expectedTarget = reviewerIsBuyer ? transaction.getSeller() : transaction.getBuyer();
        if (request.targetUserId() == null || !expectedTarget.getId().equals(request.targetUserId())) {
            throw new BadRequestException(MessageConstants.REVIEW_TARGET_INVALID);
        }

        if (request.productId() == null || !transaction.getProduct().getId().equals(request.productId())) {
            throw new BadRequestException(MessageConstants.REVIEW_PRODUCT_INVALID);
        }

        if (reviewRepository.existsByTransactionIdAndUser_IdAndTargetUser_Id(
                transaction.getId(), userId, expectedTarget.getId())) {
            throw new ConflictException(MessageConstants.REVIEW_ALREADY_EXISTS);
        }

        Review review = Review.builder()
                .user(reviewer)
                .product(transaction.getProduct())
                .targetUser(expectedTarget)
                .transactionId(transaction.getId())
                .rating(request.rating())
                .content(request.content())
                .build();

        reviewRepository.save(review);
        return mapper.toResponse(review);
    }
}
