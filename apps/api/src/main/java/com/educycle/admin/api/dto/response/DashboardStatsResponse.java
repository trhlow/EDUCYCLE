package com.educycle.admin.api.dto.response;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalUsers,
        long totalProducts,
        long pendingProducts,
        long totalTransactions,
        BigDecimal totalRevenue
) {}
