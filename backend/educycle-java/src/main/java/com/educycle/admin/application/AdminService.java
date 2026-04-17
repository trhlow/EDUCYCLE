package com.educycle.admin.application;

import com.educycle.admin.dto.AdminCreateUserRequest;
import com.educycle.admin.dto.AdminUpdateUserRequest;
import com.educycle.admin.dto.AdminUserDetailResponse;
import com.educycle.admin.dto.AdminUserSummaryResponse;
import com.educycle.admin.dto.DashboardStatsResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for admin dashboard operations.
 * Extracts business logic from AdminController for proper layered architecture.
 */
public interface AdminService {
    DashboardStatsResponse getStats();
    List<AdminUserSummaryResponse> getAllUsers();

    AdminUserDetailResponse getUserById(UUID id);

    AdminUserDetailResponse createUser(AdminCreateUserRequest request);

    AdminUserDetailResponse updateUser(UUID id, AdminUpdateUserRequest request, UUID actingAdminId);
}
