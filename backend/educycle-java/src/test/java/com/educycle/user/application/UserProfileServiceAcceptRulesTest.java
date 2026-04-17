package com.educycle.user.application;

import com.educycle.user.api.dto.response.UserMeResponse;
import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.user.infrastructure.persistence.UserRepository;
import com.educycle.user.application.service.impl.UserProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceAcceptRulesTest {

    @Mock private UserRepository userRepository;
    @Mock private ReviewRepository reviewRepository;

    private UserProfileServiceImpl userProfileService;

    private User user;

    @BeforeEach
    void setUp() {
        userProfileService = new UserProfileServiceImpl(userRepository, reviewRepository);
        user = User.builder()
                .id(UUID.randomUUID())
                .username("u")
                .email("u@student.edu.vn")
                .passwordHash("hash")
                .role(Role.USER)
                .emailVerified(true)
                .phoneVerified(false)
                .build();
    }

    @Test
    @DisplayName("acceptTransactionRules sets timestamp when null")
    void setsTimestamp() {
        given(userRepository.findById(user.getId())).willReturn(Optional.of(user));

        UserMeResponse res = userProfileService.acceptTransactionRules(user.getId());

        assertThat(res.transactionRulesAcceptedAt()).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("acceptTransactionRules is idempotent when already set")
    void idempotent() {
        Instant first = Instant.parse("2025-01-01T00:00:00Z");
        user.setTransactionRulesAcceptedAt(first);
        given(userRepository.findById(user.getId())).willReturn(Optional.of(user));

        UserMeResponse res = userProfileService.acceptTransactionRules(user.getId());

        assertThat(res.transactionRulesAcceptedAt()).isEqualTo(first);
        verify(userRepository, never()).save(any());
    }
}
