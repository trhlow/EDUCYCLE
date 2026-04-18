package com.educycle.user.application.usecase;

import com.educycle.review.domain.Review;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.api.dto.response.PublicReviewSnippet;
import com.educycle.user.api.dto.response.PublicUserProfileResponse;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicUserProfileUseCase {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public PublicUserProfileResponse getPublicProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
        double avg = reviewRepository.averageRatingForTargetUser(userId);
        long count = reviewRepository.countReviewsForTargetUser(userId);
        List<Review> recent = reviewRepository.findByTargetUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 10));
        List<PublicReviewSnippet> snippets = recent.stream()
                .map(review -> new PublicReviewSnippet(
                        review.getId(),
                        review.getUser() != null ? review.getUser().getUsername() : "Ẩn danh",
                        review.getRating(),
                        review.getContent(),
                        review.getCreatedAt()))
                .toList();
        return new PublicUserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getBio(),
                user.getAvatar(),
                avg,
                count,
                snippets);
    }
}
