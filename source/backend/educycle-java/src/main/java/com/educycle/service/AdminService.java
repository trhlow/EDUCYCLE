package com.educycle.service;

import com.educycle.dto.admin.AdminUserSummaryResponse;
import com.educycle.dto.admin.DashboardStatsResponse;

import java.util.List;

/**
 * Service interface for admin dashboard operations.
 * Extracts business logic from AdminController for proper layered architecture.
 */
public interface AdminService {
    DashboardStatsResponse getStats();
    List<AdminUserSummaryResponse> getAllUsers();
}
