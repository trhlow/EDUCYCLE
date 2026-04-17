package com.educycle.user.application.service;

import com.educycle.user.api.dto.response.PublicUserProfileResponse;
import com.educycle.user.api.dto.request.UpdateNotificationPrefsRequest;
import com.educycle.user.api.dto.request.UpdateUserProfileRequest;
import com.educycle.user.api.dto.response.UserMeResponse;

import java.util.UUID;

public interface UserProfileService {

    UserMeResponse getMe(UUID userId);

    UserMeResponse updateMe(UUID userId, UpdateUserProfileRequest request);

    UserMeResponse updateNotificationPrefs(UUID userId, UpdateNotificationPrefsRequest request);

    /** Ghi nhận user đã chấp nhận nội quy giao dịch (một lần, idempotent). */
    UserMeResponse acceptTransactionRules(UUID userId);

    PublicUserProfileResponse getPublicProfile(UUID userId);
}
