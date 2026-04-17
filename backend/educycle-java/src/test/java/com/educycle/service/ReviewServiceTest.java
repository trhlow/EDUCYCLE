package com.educycle.service;

import com.educycle.review.dto.CreateReviewRequest;
import com.educycle.review.dto.ReviewResponse;
import com.educycle.user.domain.Role;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.listing.domain.Product;
import com.educycle.review.domain.Review;
import com.educycle.user.domain.User;
import com.educycle.listing.persistence.ProductRepository;
import com.educycle.review.persistence.ReviewRepository;
import com.educycle.user.persistence.UserRepository;
import com.educycle.review.application.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
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
    @Mock private ProductRepository productRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User reviewer;
    private Product product;

    @BeforeEach
    void setUp() {
        reviewer = User.builder()
                .id(UUID.randomUUID()).username("testuser").email("test@test.com")
                .passwordHash("hash").role(Role.USER)
                .emailVerified(false).phoneVerified(false)
                .build();

        product = Product.builder()
                .id(UUID.randomUUID()).name("Product").price(BigDecimal.TEN)
                .user(reviewer).createdAt(Instant.now())
                .build();
    }

    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("should create product review successfully")
        void shouldCreateProductReview() {
            CreateReviewRequest req = new CreateReviewRequest(
                    product.getId(), null, null, 5, "Great product!");

            given(userRepository.findById(reviewer.getId())).willReturn(Optional.of(reviewer));
            given(productRepository.findById(product.getId())).willReturn(Optional.of(product));

            ReviewResponse result = reviewService.create(req, reviewer.getId());

            assertThat(result).isNotNull();
            assertThat(result.rating()).isEqualTo(5);
            assertThat(result.content()).isEqualTo("Great product!");
            verify(reviewRepository, times(1)).save(any(Review.class));
        }

        @Test
        @DisplayName("should throw NotFoundException when reviewer not found")
        void shouldThrow_whenReviewerNotFound() {
            CreateReviewRequest req = new CreateReviewRequest(null, null, null, 4, "Good");
            given(userRepository.findById(reviewer.getId())).willReturn(Optional.empty());

            assertThatThrownBy(() -> reviewService.create(req, reviewer.getId()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("should delete review when owner requests")
        void shouldDelete_whenOwner() {
            Review review = buildReview(reviewer);
            given(reviewRepository.findById(review.getId())).willReturn(Optional.of(review));

            reviewService.delete(review.getId(), reviewer.getId());

            verify(reviewRepository, times(1)).delete(review);
        }

        @Test
        @DisplayName("should throw UnauthorizedException when not owner")
        void shouldThrow_whenNotOwner() {
            Review review = buildReview(reviewer);
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
            List<Review> reviews = List.of(buildReview(reviewer), buildReview(reviewer));
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

    // ===== Helpers =====

    private Review buildReview(User user) {
        return Review.builder()
                .id(UUID.randomUUID())
                .user(user)
                .product(product)
                .rating(4)
                .content("Test review content")
                .createdAt(Instant.now())
                .build();
    }
}
