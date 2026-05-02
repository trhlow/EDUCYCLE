package com.educycle.admin.api;

import com.educycle.admin.api.dto.request.AdminCreateUserRequest;
import com.educycle.admin.api.dto.request.AdminResolveTransactionRequest;
import com.educycle.admin.api.dto.request.AdminUpdateUserRequest;
import com.educycle.admin.api.dto.response.AdminUserDetailResponse;
import com.educycle.admin.api.dto.response.AdminUserSummaryResponse;
import com.educycle.admin.api.dto.response.DashboardStatsResponse;
import com.educycle.shared.dto.common.PageResponse;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.admin.application.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<PageResponse<AdminUserSummaryResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(adminService.listUsers(page, size, direction));
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
    public ResponseEntity<PageResponse<TransactionResponse>> listDisputedTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(adminService.listDisputedTransactions(page, size, direction));
    }

    @PatchMapping("/transactions/{id}/resolve")
    public ResponseEntity<TransactionResponse> resolveDisputedTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody AdminResolveTransactionRequest request) {

        return ResponseEntity.ok(adminService.resolveDisputedTransaction(id, request));
    }
}
