package com.educycle.service;

import com.educycle.dto.admin.AdminCreateUserRequest;
import com.educycle.dto.admin.AdminUpdateUserRequest;
import com.educycle.dto.admin.AdminUserDetailResponse;
import com.educycle.dto.admin.AdminUserSummaryResponse;
import com.educycle.dto.admin.DashboardStatsResponse;

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
