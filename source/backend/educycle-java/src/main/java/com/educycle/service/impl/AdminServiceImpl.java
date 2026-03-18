package com.educycle.service.impl;

import com.educycle.dto.admin.DashboardStatsResponse;
import com.educycle.enums.ProductStatus;
import com.educycle.repository.ProductRepository;
import com.educycle.repository.TransactionRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Implements admin dashboard logic previously in AdminController.
 * Proper separation of concerns: controller is now a thin HTTP adapter.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public DashboardStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long pendingProducts = productRepository.countByStatus(ProductStatus.PENDING);
        long totalTransactions = transactionRepository.count();
        BigDecimal totalRevenue = transactionRepository.sumCompletedAmount();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        return new DashboardStatsResponse(
                totalUsers, totalProducts, pendingProducts,
                totalTransactions, totalRevenue);
    }

    @Override
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "role", u.getRole().name(),
                        "createdAt", u.getCreatedAt()
                ))
                .toList();
    }
}
