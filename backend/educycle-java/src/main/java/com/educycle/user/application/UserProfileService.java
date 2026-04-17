package com.educycle.user.application;

import com.educycle.user.dto.PublicUserProfileResponse;
import com.educycle.user.dto.UpdateNotificationPrefsRequest;
import com.educycle.user.dto.UpdateUserProfileRequest;
import com.educycle.user.dto.UserMeResponse;

import java.util.UUID;

public interface UserProfileService {

    UserMeResponse getMe(UUID userId);

    UserMeResponse updateMe(UUID userId, UpdateUserProfileRequest request);

    UserMeResponse updateNotificationPrefs(UUID userId, UpdateNotificationPrefsRequest request);

    /** Ghi nhận user đã chấp nhận nội quy giao dịch (một lần, idempotent). */
    UserMeResponse acceptTransactionRules(UUID userId);

    PublicUserProfileResponse getPublicProfile(UUID userId);
}
