package com.educycle.service;

import com.educycle.dto.user.PublicUserProfileResponse;
import com.educycle.dto.user.UpdateUserProfileRequest;
import com.educycle.dto.user.UserMeResponse;

import java.util.UUID;

public interface UserProfileService {

    UserMeResponse getMe(UUID userId);

    UserMeResponse updateMe(UUID userId, UpdateUserProfileRequest request);

    PublicUserProfileResponse getPublicProfile(UUID userId);
}
