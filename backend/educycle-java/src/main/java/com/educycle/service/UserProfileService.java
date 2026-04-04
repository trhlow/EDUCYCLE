package com.educycle.service;

import com.educycle.dto.user.PublicUserProfileResponse;
import com.educycle.dto.user.UpdateNotificationPrefsRequest;
import com.educycle.dto.user.UpdateUserProfileRequest;
import com.educycle.dto.user.UserMeResponse;

import java.util.UUID;

public interface UserProfileService {

    UserMeResponse getMe(UUID userId);

    UserMeResponse updateMe(UUID userId, UpdateUserProfileRequest request);

    UserMeResponse updateNotificationPrefs(UUID userId, UpdateNotificationPrefsRequest request);

    /** Ghi nhận user đã chấp nhận nội quy giao dịch (một lần, idempotent). */
    UserMeResponse acceptTransactionRules(UUID userId);

    PublicUserProfileResponse getPublicProfile(UUID userId);
}
