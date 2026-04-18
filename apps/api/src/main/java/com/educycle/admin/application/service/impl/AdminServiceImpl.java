package com.educycle.admin.application.service.impl;

import com.educycle.admin.api.dto.request.AdminCreateUserRequest;
import com.educycle.admin.api.dto.request.AdminResolveTransactionRequest;
import com.educycle.admin.api.dto.request.AdminUpdateUserRequest;
import com.educycle.admin.api.dto.response.AdminUserDetailResponse;
import com.educycle.admin.api.dto.response.AdminUserSummaryResponse;
import com.educycle.admin.api.dto.response.DashboardStatsResponse;
import com.educycle.admin.application.service.AdminService;
import com.educycle.admin.application.usecase.AdminStatsUseCase;
import com.educycle.admin.application.usecase.AdminUsersUseCase;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.application.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminStatsUseCase statsUseCase;
    private final AdminUsersUseCase usersUseCase;
    private final TransactionService transactionService;

    @Override
    public DashboardStatsResponse getStats() {
        return statsUseCase.getStats();
    }

    @Override
    public List<AdminUserSummaryResponse> getAllUsers() {
        return usersUseCase.getAllUsers();
    }

    @Override
    public AdminUserDetailResponse getUserById(UUID id) {
        return usersUseCase.getUserById(id);
    }

    @Override
    public AdminUserDetailResponse createUser(AdminCreateUserRequest request) {
        return usersUseCase.createUser(request);
    }

    @Override
    public AdminUserDetailResponse updateUser(UUID id, AdminUpdateUserRequest request, UUID actingAdminId) {
        return usersUseCase.updateUser(id, request, actingAdminId);
    }

    @Override
    public List<TransactionResponse> listDisputedTransactions() {
        return transactionService.listDisputedTransactions();
    }

    @Override
    public TransactionResponse resolveDisputedTransaction(UUID id, AdminResolveTransactionRequest request) {
        return transactionService.adminResolveDispute(id, request);
    }
}
