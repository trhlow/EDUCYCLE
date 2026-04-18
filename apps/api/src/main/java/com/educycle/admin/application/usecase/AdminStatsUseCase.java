package com.educycle.admin.application.usecase;

import com.educycle.admin.api.dto.response.DashboardStatsResponse;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsUseCase {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;

    public DashboardStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long pendingProducts = productRepository.countByStatus(ProductStatus.PENDING);
        long totalTransactions = transactionRepository.count();
        BigDecimal totalRevenue = transactionRepository.sumCompletedAmount();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return new DashboardStatsResponse(
                totalUsers, totalProducts, pendingProducts,
                totalTransactions, totalRevenue);
    }
}
