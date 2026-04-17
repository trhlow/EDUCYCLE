package com.educycle.transaction.schedule;

import com.educycle.transaction.application.TransactionExpiryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Định kỳ hủy giao dịch PENDING / ACCEPTED quá hạn (cấu hình trong {@code educycle.transactions.expiry}).
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "educycle.transactions.expiry", name = "enabled", havingValue = "true")
public class TransactionExpiryScheduler {

    private final TransactionExpiryService transactionExpiryService;

    @Scheduled(fixedDelayString = "${educycle.transactions.expiry.check-interval-ms:3600000}")
    public void runExpiry() {
        try {
            transactionExpiryService.expireStaleTransactions();
        } catch (Exception e) {
            log.error("Transaction expiry job failed", e);
        }
    }
}
