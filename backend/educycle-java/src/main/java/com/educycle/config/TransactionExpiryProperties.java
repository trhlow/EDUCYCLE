package com.educycle.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Hết hạn giao dịch tự động — job định kỳ (Sprint B).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "educycle.transactions.expiry")
public class TransactionExpiryProperties {

    /** Bật {@link com.educycle.scheduler.TransactionExpiryScheduler}. */
    private boolean enabled = true;

    /** PENDING: hủy nếu yêu cầu tạo trước khoảng thời gian này (giờ). */
    private int pendingStaleHours = 48;

    /** ACCEPTED/MEETING: hủy nếu không cập nhật (hoàn tất) trước khoảng thời gian này (giờ). */
    private int acceptedStaleHours = 168;

    /** Chu kỳ chạy job (ms), mặc định 1 giờ. */
    private long checkIntervalMs = 3_600_000L;
}
