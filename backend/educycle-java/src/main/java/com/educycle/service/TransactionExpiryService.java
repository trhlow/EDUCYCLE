package com.educycle.service;

/** Job hết hạn giao dịch — gọi từ {@link com.educycle.scheduler.TransactionExpiryScheduler}. */
public interface TransactionExpiryService {

    /** Tìm giao dịch quá hạn, chuyển sang CANCELLED + lý do hệ thống + thông báo. */
    void expireStaleTransactions();
}
