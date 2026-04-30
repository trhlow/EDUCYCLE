package com.educycle.user.application.usecase;

import com.educycle.auth.application.support.AuthUsernamePolicy;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ConflictException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.api.dto.request.UpdateNotificationPrefsRequest;
import com.educycle.user.api.dto.request.UpdateUserProfileRequest;
import com.educycle.user.api.dto.response.UserMeResponse;
import com.educycle.user.application.support.UserProfileMapper;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CurrentUserProfileUseCase {

    private final UserRepository userRepository;
    private final UserProfileMapper mapper;

    @Transactional(readOnly = true)
    public UserMeResponse getMe(UUID userId) {
        return mapper.toMeResponse(loadUser(userId));
    }

    public UserMeResponse updateMe(UUID userId, UpdateUserProfileRequest request) {
        User user = loadUser(userId);
        String normalized = AuthUsernamePolicy.normalize(request.username());
        if (!AuthUsernamePolicy.isValidNormalized(normalized)) {
            throw new BadRequestException(MessageConstants.VALIDATION_FAILED);
        }
        if (userRepository.existsByUsernameAndIdNot(normalized, userId)) {
            throw new ConflictException(MessageConstants.USERNAME_TAKEN);
        }
        user.setUsername(normalized);
        if (request.bio() != null) {
            String bio = request.bio().trim();
            user.setBio(bio.isEmpty() ? null : bio);
        }
        if (request.avatar() != null) {
            String avatar = request.avatar().trim();
            user.setAvatar(avatar.isEmpty() ? null : avatar);
        }
        userRepository.save(user);
        return mapper.toMeResponse(user);
    }

    public UserMeResponse updateNotificationPrefs(UUID userId, UpdateNotificationPrefsRequest request) {
        User user = loadUser(userId);
        user.setNotifyProductModeration(request.notifyProductModeration());
        user.setNotifyTransactions(request.notifyTransactions());
        user.setNotifyMessages(request.notifyMessages());
        userRepository.save(user);
        return mapper.toMeResponse(user);
    }

    public UserMeResponse acceptTransactionRules(UUID userId) {
        User user = loadUser(userId);
        if (user.getTransactionRulesAcceptedAt() == null) {
            user.setTransactionRulesAcceptedAt(Instant.now());
            userRepository.save(user);
        }
        return mapper.toMeResponse(user);
    }

    private User loadUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
    }
}
