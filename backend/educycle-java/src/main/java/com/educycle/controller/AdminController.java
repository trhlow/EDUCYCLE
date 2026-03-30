package com.educycle.controller;

import com.educycle.dto.admin.AdminResolveTransactionRequest;
import com.educycle.dto.admin.AdminUserSummaryResponse;
import com.educycle.dto.admin.DashboardStatsResponse;
import com.educycle.dto.transaction.TransactionResponse;
import com.educycle.service.AdminService;
import com.educycle.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
