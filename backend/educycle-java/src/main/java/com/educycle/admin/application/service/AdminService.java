package com.educycle.admin.application.service;

import com.educycle.admin.api.dto.request.AdminCreateUserRequest;
import com.educycle.admin.api.dto.request.AdminUpdateUserRequest;
import com.educycle.admin.api.dto.response.AdminUserDetailResponse;
import com.educycle.admin.api.dto.response.AdminUserSummaryResponse;
import com.educycle.admin.api.dto.response.DashboardStatsResponse;

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
