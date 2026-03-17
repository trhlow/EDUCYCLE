package com.educycle.controller;

import com.educycle.dto.admin.DashboardStatsResponse;
import com.educycle.enums.ProductStatus;
import com.educycle.enums.TransactionStatus;
import com.educycle.repository.ProductRepository;
import com.educycle.repository.TransactionRepository;
import com.educycle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Maps C# AdminController.cs
 *
 * Key differences:
 *  - ApplicationDbContext direct queries  → Spring Data repository aggregation methods
 *  - [Authorize(Roles = "Admin")]         → @PreAuthorize("hasRole('ADMIN')")
 *  - Anonymous projection (new { u.Id })  → Map.of() or a dedicated record
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")       // class-level: all endpoints require ADMIN
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository        userRepository;
    private final ProductRepository     productRepository;
    private final TransactionRepository transactionRepository;

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        long totalUsers        = userRepository.count();
        long totalProducts     = productRepository.count();
        long pendingProducts   = productRepository.countByStatus(ProductStatus.PENDING);
        long totalTransactions = transactionRepository.count();
        BigDecimal totalRevenue = transactionRepository.sumCompletedAmount();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        return ResponseEntity.ok(new DashboardStatsResponse(
                totalUsers, totalProducts, pendingProducts,
                totalTransactions, totalRevenue));
    }

    // GET /api/admin/users
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll()
                .stream()
                .map(u -> Map.<String, Object>of(
                        "id",        u.getId(),
                        "username",  u.getUsername(),
                        "email",     u.getEmail(),
                        "role",      u.getRole().name(),
                        "createdAt", u.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(users);
    }
}
