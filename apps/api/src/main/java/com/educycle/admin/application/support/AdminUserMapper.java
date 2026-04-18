package com.educycle.admin.application.support;

import com.educycle.admin.api.dto.response.AdminUserDetailResponse;
import com.educycle.admin.api.dto.response.AdminUserSummaryResponse;
import com.educycle.shared.util.PrivacyHelper;
import com.educycle.user.domain.User;
import org.springframework.stereotype.Component;

@Component
public class AdminUserMapper {

    public AdminUserSummaryResponse toSummary(User user) {
        return new AdminUserSummaryResponse(
                user.getId(),
                user.getUsername(),
                PrivacyHelper.maskEmail(user.getEmail()),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }

    public AdminUserDetailResponse toDetail(User user) {
        return new AdminUserDetailResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.isEmailVerified(),
                user.isTradingAllowed(),
                user.getCreatedAt());
    }
}
