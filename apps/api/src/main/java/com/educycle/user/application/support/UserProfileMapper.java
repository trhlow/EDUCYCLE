package com.educycle.user.application.support;

import com.educycle.user.api.dto.response.UserMeResponse;
import com.educycle.user.domain.User;
import org.springframework.stereotype.Component;

@Component
public class UserProfileMapper {

    public UserMeResponse toMeResponse(User user) {
        return new UserMeResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.isEmailVerified(),
                user.isPhoneVerified(),
                user.getPhone(),
                user.getBio(),
                user.getAvatar(),
                user.isNotifyProductModeration(),
                user.isNotifyTransactions(),
                user.isNotifyMessages(),
                user.getTransactionRulesAcceptedAt()
        );
    }
}
