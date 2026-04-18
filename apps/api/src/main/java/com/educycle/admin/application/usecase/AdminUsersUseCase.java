package com.educycle.admin.application.usecase;

import com.educycle.admin.api.dto.request.AdminCreateUserRequest;
import com.educycle.admin.api.dto.request.AdminUpdateUserRequest;
import com.educycle.admin.api.dto.response.AdminUserDetailResponse;
import com.educycle.admin.api.dto.response.AdminUserSummaryResponse;
import com.educycle.admin.application.support.AdminUserMapper;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUsersUseCase {

    private static final Pattern EDU_VN_EMAIL = Pattern.compile("(?i)^[^@\\s]+@[^@\\s]+\\.edu\\.vn$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminUserMapper mapper;

    @Transactional(readOnly = true)
    public List<AdminUserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(mapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
        return mapper.toDetail(user);
    }

    public AdminUserDetailResponse createUser(AdminCreateUserRequest request) {
        String email = normalizeEmail(request.email());
        String username = request.username().trim();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException(MessageConstants.EMAIL_ALREADY_EXISTS);
        }
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException(MessageConstants.ADMIN_USERNAME_TAKEN);
        }

        boolean verified = request.emailVerified() == null || request.emailVerified();
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role() != null ? request.role() : Role.USER)
                .emailVerified(verified)
                .phoneVerified(false)
                .tradingAllowed(isEduVn(email))
                .build();
        if (verified) {
            user.setEmailVerificationToken(null);
            user.setEmailVerificationTokenExpiry(null);
        }
        userRepository.save(user);
        return mapper.toDetail(user);
    }

    public AdminUserDetailResponse updateUser(UUID id, AdminUpdateUserRequest request, UUID actingAdminId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        if (request.username() != null && StringUtils.hasText(request.username())) {
            String username = request.username().trim();
            if (userRepository.existsByUsernameAndIdNot(username, id)) {
                throw new BadRequestException(MessageConstants.ADMIN_USERNAME_TAKEN);
            }
            user.setUsername(username);
        }
        if (request.email() != null && StringUtils.hasText(request.email())) {
            String email = normalizeEmail(request.email());
            userRepository.findByEmail(email)
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(other -> {
                        throw new BadRequestException(MessageConstants.EMAIL_ALREADY_EXISTS);
                    });
            user.setEmail(email);
            user.setTradingAllowed(isEduVn(email));
        }
        if (request.password() != null && StringUtils.hasText(request.password())) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.role() != null) {
            if (user.getId().equals(actingAdminId)
                    && user.getRole() == Role.ADMIN
                    && request.role() != Role.ADMIN) {
                throw new BadRequestException(MessageConstants.ADMIN_CANNOT_DEMOTE_SELF);
            }
            user.setRole(request.role());
        }
        if (request.tradingAllowed() != null) {
            user.setTradingAllowed(request.tradingAllowed());
        }
        if (request.emailVerified() != null) {
            user.setEmailVerified(request.emailVerified());
            if (request.emailVerified()) {
                user.setEmailVerificationToken(null);
                user.setEmailVerificationTokenExpiry(null);
            }
        }
        userRepository.save(user);
        return mapper.toDetail(user);
    }

    private static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean isEduVn(String normalizedEmail) {
        return normalizedEmail != null && EDU_VN_EMAIL.matcher(normalizedEmail).matches();
    }
}
