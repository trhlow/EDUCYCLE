package com.educycle.controller;

import com.educycle.dto.admin.AdminCreateUserRequest;
import com.educycle.dto.admin.AdminResolveTransactionRequest;
import com.educycle.dto.admin.AdminUpdateUserRequest;
import com.educycle.dto.admin.AdminUserDetailResponse;
import com.educycle.dto.admin.AdminUserSummaryResponse;
import com.educycle.dto.admin.DashboardStatsResponse;
import com.educycle.dto.transaction.TransactionResponse;
import com.educycle.service.AdminService;
import com.educycle.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin dashboard endpoints.
 * Thin controller — all business logic delegated to AdminService.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService        adminService;
    private final TransactionService transactionService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDetailResponse> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserDetailResponse> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return ResponseEntity.ok(adminService.createUser(request));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<AdminUserDetailResponse> updateUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal String adminUserId,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request, UUID.fromString(adminUserId)));
    }

    @GetMapping("/transactions/disputed")
    public ResponseEntity<List<TransactionResponse>> listDisputedTransactions() {
        return ResponseEntity.ok(transactionService.listDisputedTransactions());
    }

    @PatchMapping("/transactions/{id}/resolve")
    public ResponseEntity<TransactionResponse> resolveDisputedTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody AdminResolveTransactionRequest request) {

        return ResponseEntity.ok(transactionService.adminResolveDispute(id, request));
    }
}
