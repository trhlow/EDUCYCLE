package com.educycle.admin.application.service;

import com.educycle.admin.api.dto.request.AdminCreateUserRequest;
import com.educycle.admin.api.dto.request.AdminResolveTransactionRequest;
import com.educycle.admin.api.dto.request.AdminUpdateUserRequest;
import com.educycle.admin.api.dto.response.AdminUserDetailResponse;
import com.educycle.admin.api.dto.response.AdminUserSummaryResponse;
import com.educycle.admin.api.dto.response.DashboardStatsResponse;
import com.educycle.shared.dto.common.PageResponse;
import com.educycle.transaction.api.dto.response.TransactionResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for admin dashboard operations.
 * Extracts business logic from AdminController for proper layered architecture.
 */
public interface AdminService {
    DashboardStatsResponse getStats();
    List<AdminUserSummaryResponse> getAllUsers();
    PageResponse<AdminUserSummaryResponse> listUsers(int page, int size, String direction);

    AdminUserDetailResponse getUserById(UUID id);

    AdminUserDetailResponse createUser(AdminCreateUserRequest request);

    AdminUserDetailResponse updateUser(UUID id, AdminUpdateUserRequest request, UUID actingAdminId);

    PageResponse<TransactionResponse> listDisputedTransactions(int page, int size, String direction);

    TransactionResponse resolveDisputedTransaction(UUID id, AdminResolveTransactionRequest request);
}
