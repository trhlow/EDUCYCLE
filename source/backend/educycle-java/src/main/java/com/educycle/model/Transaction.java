package com.educycle.model;

import com.educycle.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_transaction_product"))
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_transaction_buyer"))
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_transaction_seller"))
    private User seller;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;

    /** SHA-256 hex = 64 ký tự — cột DB trước đây VARCHAR(10) gây lỗi khi lưu hash */
    @Column(name = "otp_code", length = 64)
    private String otpCode;

    @Column(name = "otp_expires_at")
    private Instant otpExpiresAt;

    @Column(name = "buyer_confirmed", nullable = false)
    @Builder.Default
    private boolean buyerConfirmed = false;

    @Column(name = "seller_confirmed", nullable = false)
    @Builder.Default
    private boolean sellerConfirmed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "disputed_at")
    private Instant disputedAt;
}
