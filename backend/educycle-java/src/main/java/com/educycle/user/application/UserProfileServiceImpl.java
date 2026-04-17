package com.educycle.user.application;

import com.educycle.user.dto.PublicReviewSnippet;
import com.educycle.user.dto.PublicUserProfileResponse;
import com.educycle.user.dto.UpdateNotificationPrefsRequest;
import com.educycle.user.dto.UpdateUserProfileRequest;
import com.educycle.user.dto.UserMeResponse;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.review.domain.Review;
import com.educycle.user.domain.User;
import com.educycle.review.persistence.ReviewRepository;
import com.educycle.user.persistence.UserRepository;
import com.educycle.user.application.UserProfileService;
import com.educycle.shared.util.MessageConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository   userRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public UserMeResponse getMe(UUID userId) {
        return toResponse(loadUser(userId));
    }

    @Override
    public UserMeResponse updateMe(UUID userId, UpdateUserProfileRequest request) {
        User u = loadUser(userId);
        u.setUsername(request.username().trim());
        if (request.bio() != null) {
            String b = request.bio().trim();
            u.setBio(b.isEmpty() ? null : b);
        }
        if (request.avatar() != null) {
            String a = request.avatar().trim();
            u.setAvatar(a.isEmpty() ? null : a);
        }
        userRepository.save(u);
        return toResponse(u);
    }

    @Override
    public UserMeResponse updateNotificationPrefs(UUID userId, UpdateNotificationPrefsRequest request) {
        User u = loadUser(userId);
        u.setNotifyProductModeration(request.notifyProductModeration());
        u.setNotifyTransactions(request.notifyTransactions());
        u.setNotifyMessages(request.notifyMessages());
        userRepository.save(u);
        return toResponse(u);
    }

    @Override
    public UserMeResponse acceptTransactionRules(UUID userId) {
        User u = loadUser(userId);
        if (u.getTransactionRulesAcceptedAt() == null) {
            u.setTransactionRulesAcceptedAt(Instant.now());
            userRepository.save(u);
        }
        return toResponse(u);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserProfileResponse getPublicProfile(UUID userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
        double avg   = reviewRepository.averageRatingForTargetUser(userId);
        long   count = reviewRepository.countReviewsForTargetUser(userId);
        List<Review> recent = reviewRepository.findByTargetUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(0, 10));
        List<PublicReviewSnippet> snippets = recent.stream()
                .map(r -> new PublicReviewSnippet(
                        r.getId(),
                        r.getUser() != null ? r.getUser().getUsername() : "Ẩn danh",
                        r.getRating(),
                        r.getContent(),
                        r.getCreatedAt()))
                .toList();
        return new PublicUserProfileResponse(
                u.getId(),
                u.getUsername(),
                u.getBio(),
                u.getAvatar(),
                avg,
                count,
                snippets);
    }

    private User loadUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
    }

    private static UserMeResponse toResponse(User u) {
        return new UserMeResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRole().name(),
                u.isEmailVerified(),
                u.isPhoneVerified(),
                u.getPhone(),
                u.getBio(),
                u.getAvatar(),
                u.isNotifyProductModeration(),
                u.isNotifyTransactions(),
                u.isNotifyMessages(),
                u.getTransactionRulesAcceptedAt()
        );
    }
}
