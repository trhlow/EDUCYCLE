package com.educycle.dto.admin;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalUsers,
        long totalProducts,
        long pendingProducts,
        long totalTransactions,
        BigDecimal totalRevenue
) {}
