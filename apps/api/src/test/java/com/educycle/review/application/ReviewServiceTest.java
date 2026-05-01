package com.educycle.review.application;

import com.educycle.review.api.dto.request.CreateReviewRequest;
import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ConflictException;
import com.educycle.shared.exception.ForbiddenException;
import com.educycle.user.domain.Role;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.listing.domain.Product;
import com.educycle.review.domain.Review;
import com.educycle.user.domain.User;
import com.educycle.review.application.support.ReviewResponseMapper;
import com.educycle.review.application.usecase.CreateReviewUseCase;
import com.educycle.review.application.usecase.DeleteReviewUseCase;
import com.educycle.review.application.usecase.ReviewQueryUseCase;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.user.infrastructure.persistence.UserRepository;
import com.educycle.review.application.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService Tests")
class ReviewServiceTest {

    @Mock private ReviewRepository  reviewRepository;
    @Mock private UserRepository    userRepository;
    @Mock private TransactionRepository transactionRepository;

    private ReviewServiceImpl reviewService;

    private User buyer;
    private User seller;
    private Product product;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        buyer = User.builder()
                .id(UUID.randomUUID()).username("buyer").email("buyer@test.com")
                .passwordHash("hash").role(Role.USER)
                .emailVerified(false).phoneVerified(false)
                .build();
        seller = User.builder()
                .id(UUID.randomUUID()).username("seller").email("seller@test.com")
                .passwordHash("hash").role(Role.USER)
                .emailVerified(false).phoneVerified(false)
                .build();

        product = Product.builder()
                .id(UUID.randomUUID()).name("Product").price(BigDecimal.TEN)
                .user(seller).createdAt(Instant.now())
                .build();
        transaction = Transaction.builder()
                .id(UUID.randomUUID())
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .amount(BigDecimal.TEN)
                .status(TransactionStatus.COMPLETED)
                .build();

        ReviewResponseMapper mapper = new ReviewResponseMapper();
        reviewService = new ReviewServiceImpl(
                new CreateReviewUseCase(reviewRepository, userRepository, transactionRepository, mapper),
                new ReviewQueryUseCase(reviewRepository, mapper),
                new DeleteReviewUseCase(reviewRepository));
    }

    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("should create transaction review successfully")
        void shouldCreateTransactionReview() {
            CreateReviewRequest req = new CreateReviewRequest(
                    product.getId(), seller.getId(), transaction.getId(), 5, "Great product!");

            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));
            given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));
            given(reviewRepository.existsByTransactionIdAndUser_IdAndTargetUser_Id(
                    transaction.getId(), buyer.getId(), seller.getId())).willReturn(false);

            ReviewResponse result = reviewService.create(req, buyer.getId());

            assertThat(result).isNotNull();
            assertThat(result.rating()).isEqualTo(5);
            assertThat(result.content()).isEqualTo("Great product!");
            verify(reviewRepository, times(1)).save(any(Review.class));
        }

        @Test
        @DisplayName("should throw NotFoundException when reviewer not found")
        void shouldThrow_whenReviewerNotFound() {
            CreateReviewRequest req = new CreateReviewRequest(null, null, null, 4, "Good");
            given(userRepository.findById(buyer.getId())).willReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.create(req, buyer.getId()))
                    .isInstanceOf(NotFoundException.class);
        }

        @Test
        @DisplayName("should reject review without transaction")
        void shouldRejectWithoutTransaction() {
            CreateReviewRequest req = new CreateReviewRequest(product.getId(), seller.getId(), null, 5, "Great");
            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));

            assertThatThrownBy(() -> reviewService.create(req, buyer.getId()))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("should reject non participant")
        void shouldRejectNonParticipant() {
            User outsider = User.builder().id(UUID.randomUUID()).username("outsider").email("o@test.com").build();
            CreateReviewRequest req = new CreateReviewRequest(product.getId(), seller.getId(), transaction.getId(), 5, "Great");
            given(userRepository.findById(outsider.getId())).willReturn(Optional.of(outsider));
            given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));

            assertThatThrownBy(() -> reviewService.create(req, outsider.getId()))
                    .isInstanceOf(ForbiddenException.class);
        }

        @Test
        @DisplayName("should reject transaction that is not completed")
        void shouldRejectNotCompletedTransaction() {
            transaction.setStatus(TransactionStatus.ACCEPTED);
            CreateReviewRequest req = new CreateReviewRequest(product.getId(), seller.getId(), transaction.getId(), 5, "Great");
            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));
            given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));

            assertThatThrownBy(() -> reviewService.create(req, buyer.getId()))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("should reject invalid target user")
        void shouldRejectInvalidTarget() {
            CreateReviewRequest req = new CreateReviewRequest(product.getId(), buyer.getId(), transaction.getId(), 5, "Great");
            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));
            given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));

            assertThatThrownBy(() -> reviewService.create(req, buyer.getId()))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("should reject invalid product")
        void shouldRejectInvalidProduct() {
            CreateReviewRequest req = new CreateReviewRequest(UUID.randomUUID(), seller.getId(), transaction.getId(), 5, "Great");
            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));
            given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));

            assertThatThrownBy(() -> reviewService.create(req, buyer.getId()))
                    .isInstanceOf(BadRequestException.class);
        }

        @Test
        @DisplayName("should reject duplicate transaction review")
        void shouldRejectDuplicateReview() {
            CreateReviewRequest req = new CreateReviewRequest(product.getId(), seller.getId(), transaction.getId(), 5, "Great");
            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));
            given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));
            given(reviewRepository.existsByTransactionIdAndUser_IdAndTargetUser_Id(
                    transaction.getId(), buyer.getId(), seller.getId())).willReturn(true);

            assertThatThrownBy(() -> reviewService.create(req, buyer.getId()))
                    .isInstanceOf(ConflictException.class);
        }
    }

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("should delete review when owner requests")
        void shouldDelete_whenOwner() {
            Review review = buildReview(buyer);
            given(reviewRepository.findById(review.getId())).willReturn(Optional.of(review));

            reviewService.delete(review.getId(), buyer.getId());

            verify(reviewRepository, times(1)).delete(review);
        }

        @Test
        @DisplayName("should throw UnauthorizedException when not owner")
        void shouldThrow_whenNotOwner() {
            Review review = buildReview(buyer);
            given(reviewRepository.findById(review.getId())).willReturn(Optional.of(review));

            assertThatThrownBy(() -> reviewService.delete(review.getId(), UUID.randomUUID()))
                    .isInstanceOf(UnauthorizedException.class);
        }
    }

    @Nested
    @DisplayName("getByProductId()")
    class GetByProductId {

        @Test
        @DisplayName("should return reviews for a given product")
        void shouldReturnReviews() {
            UUID productId = product.getId();
            List<Review> reviews = List.of(buildReview(buyer), buildReview(buyer));
            given(reviewRepository.findByProductId(productId)).willReturn(reviews);

            List<ReviewResponse> result = reviewService.getByProductId(productId);

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("should return empty list when no reviews")
        void shouldReturnEmpty() {
            UUID productId = product.getId();
            given(reviewRepository.findByProductId(productId)).willReturn(List.of());

            List<ReviewResponse> result = reviewService.getByProductId(productId);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getByTransactionId()")
    class GetByTransactionId {

        @Test
        @DisplayName("should return reviews for a transaction")
        void shouldReturnReviewsForTransaction() {
            List<Review> reviews = List.of(buildReview(buyer));
            given(reviewRepository.findByTransactionId(transaction.getId())).willReturn(reviews);

            List<ReviewResponse> result = reviewService.getByTransactionId(transaction.getId());

            assertThat(result).hasSize(1);
        }
    }

    // ===== Helpers =====

    private Review buildReview(User user) {
        return Review.builder()
                .id(UUID.randomUUID())
                .user(user)
                .product(product)
                .targetUser(seller)
                .transactionId(transaction.getId())
                .rating(4)
                .content("Test review content")
                .createdAt(Instant.now())
                .build();
    }
}
