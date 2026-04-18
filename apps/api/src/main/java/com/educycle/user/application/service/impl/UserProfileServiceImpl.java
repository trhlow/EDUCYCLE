package com.educycle.user.application.service.impl;

import com.educycle.user.api.dto.request.UpdateNotificationPrefsRequest;
import com.educycle.user.api.dto.request.UpdateUserProfileRequest;
import com.educycle.user.api.dto.response.PublicUserProfileResponse;
import com.educycle.user.api.dto.response.UserMeResponse;
import com.educycle.user.application.service.UserProfileService;
import com.educycle.user.application.usecase.CurrentUserProfileUseCase;
import com.educycle.user.application.usecase.PublicUserProfileUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final CurrentUserProfileUseCase currentUserProfileUseCase;
    private final PublicUserProfileUseCase publicUserProfileUseCase;

    @Override
    public UserMeResponse getMe(UUID userId) {
        return currentUserProfileUseCase.getMe(userId);
    }

    @Override
    public UserMeResponse updateMe(UUID userId, UpdateUserProfileRequest request) {
        return currentUserProfileUseCase.updateMe(userId, request);
    }

    @Override
    public UserMeResponse updateNotificationPrefs(UUID userId, UpdateNotificationPrefsRequest request) {
        return currentUserProfileUseCase.updateNotificationPrefs(userId, request);
    }

    @Override
    public UserMeResponse acceptTransactionRules(UUID userId) {
        return currentUserProfileUseCase.acceptTransactionRules(userId);
    }

    @Override
    public PublicUserProfileResponse getPublicProfile(UUID userId) {
        return publicUserProfileUseCase.getPublicProfile(userId);
    }
}
