package com.educycle.admin.application;

import com.educycle.admin.dto.AdminCreateUserRequest;
import com.educycle.admin.dto.AdminUpdateUserRequest;
import com.educycle.admin.dto.AdminUserDetailResponse;
import com.educycle.admin.dto.AdminUserSummaryResponse;
import com.educycle.admin.dto.DashboardStatsResponse;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.user.domain.Role;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.user.domain.User;
import com.educycle.listing.persistence.ProductRepository;
import com.educycle.transaction.persistence.TransactionRepository;
import com.educycle.user.persistence.UserRepository;
import com.educycle.admin.application.AdminService;
import com.educycle.shared.util.MessageConstants;
import com.educycle.shared.util.PrivacyHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Implements admin dashboard logic previously in AdminController.
 * Proper separation of concerns: controller is now a thin HTTP adapter.
 */
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private static final Pattern EDU_VN_EMAIL = Pattern.compile("(?i)^[^@\\s]+@[^@\\s]+\\.edu\\.vn$");

    private final UserRepository        userRepository;
    private final ProductRepository     productRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder       passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long pendingProducts = productRepository.countByStatus(ProductStatus.PENDING);
        long totalTransactions = transactionRepository.count();
        BigDecimal totalRevenue = transactionRepository.sumCompletedAmount();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        return new DashboardStatsResponse(
                totalUsers, totalProducts, pendingProducts,
                totalTransactions, totalRevenue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> new AdminUserSummaryResponse(
                        u.getId(),
                        u.getUsername(),
                        PrivacyHelper.maskEmail(u.getEmail()),
                        u.getRole().name(),
                        u.getCreatedAt()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserById(UUID id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));
        return toDetail(u);
    }

    @Override
    @Transactional
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
        return toDetail(user);
    }

    @Override
    @Transactional
    public AdminUserDetailResponse updateUser(UUID id, AdminUpdateUserRequest request, UUID actingAdminId) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        if (request.username() != null && StringUtils.hasText(request.username())) {
            String nu = request.username().trim();
            if (userRepository.existsByUsernameAndIdNot(nu, id)) {
                throw new BadRequestException(MessageConstants.ADMIN_USERNAME_TAKEN);
            }
            u.setUsername(nu);
        }
        if (request.email() != null && StringUtils.hasText(request.email())) {
            String ne = normalizeEmail(request.email());
            userRepository.findByEmail(ne)
                    .filter(other -> !other.getId().equals(id))
                    .ifPresent(x -> {
                        throw new BadRequestException(MessageConstants.EMAIL_ALREADY_EXISTS);
                    });
            u.setEmail(ne);
            u.setTradingAllowed(isEduVn(ne));
        }
        if (request.password() != null && StringUtils.hasText(request.password())) {
            u.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.role() != null) {
            if (u.getId().equals(actingAdminId)
                    && u.getRole() == Role.ADMIN
                    && request.role() != Role.ADMIN) {
                throw new BadRequestException(MessageConstants.ADMIN_CANNOT_DEMOTE_SELF);
            }
            u.setRole(request.role());
        }
        if (request.tradingAllowed() != null) {
            u.setTradingAllowed(request.tradingAllowed());
        }
        if (request.emailVerified() != null) {
            u.setEmailVerified(request.emailVerified());
            if (request.emailVerified()) {
                u.setEmailVerificationToken(null);
                u.setEmailVerificationTokenExpiry(null);
            }
        }
        userRepository.save(u);
        return toDetail(u);
    }

    private static AdminUserDetailResponse toDetail(User u) {
        return new AdminUserDetailResponse(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getRole().name(),
                u.isEmailVerified(),
                u.isTradingAllowed(),
                u.getCreatedAt());
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
