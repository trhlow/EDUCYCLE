package com.educycle.auth.application.usecase;

import com.educycle.auth.api.dto.request.ChangePasswordRequest;
import com.educycle.auth.api.dto.request.VerifyPhoneRequest;
import com.educycle.auth.application.support.AuthRefreshTokens;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthAccountUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthRefreshTokens refreshTokens;

    public boolean verifyPhone(UUID userId, VerifyPhoneRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
        user.setPhone(request.phone());
        user.setPhoneVerified(true);
        userRepository.save(user);
        return true;
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException(MessageConstants.CURRENT_PASSWORD_WRONG);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        refreshTokens.clear(user);
        userRepository.save(user);
    }
}
