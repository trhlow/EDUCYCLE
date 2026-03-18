package com.educycle.service;

import com.educycle.dto.admin.DashboardStatsResponse;

import java.util.List;
import java.util.Map;

/**
 * Service interface for admin dashboard operations.
 * Extracts business logic from AdminController for proper layered architecture.
 */
public interface AdminService {
    DashboardStatsResponse getStats();
    List<Map<String, Object>> getAllUsers();
}
