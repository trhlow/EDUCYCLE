package com.educycle.controller;

import com.educycle.dto.user.UpdateNotificationPrefsRequest;
import com.educycle.dto.user.UpdateUserProfileRequest;
import com.educycle.dto.user.UserMeResponse;
import com.educycle.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

    private final UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> getMe(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(userProfileService.getMe(UUID.fromString(userId)));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserMeResponse> updateMe(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateUserProfileRequest request) {

        return ResponseEntity.ok(userProfileService.updateMe(UUID.fromString(userId), request));
    }

    @PatchMapping("/me/notification-preferences")
    public ResponseEntity<UserMeResponse> updateNotificationPrefs(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateNotificationPrefsRequest request) {

        return ResponseEntity.ok(userProfileService.updateNotificationPrefs(UUID.fromString(userId), request));
    }
}
