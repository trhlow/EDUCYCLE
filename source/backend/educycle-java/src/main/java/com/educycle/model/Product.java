package com.educycle.model;

import com.educycle.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Maps C# Product entity.
 * Notes:
 *  - decimal → BigDecimal (precision 18,2)
 *  - ImageUrls (JSON string) stored as TEXT column; serialization handled in service layer
 *  - CategoryId is nullable FK (ON DELETE SET NULL)
 */
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url")
    private String imageUrl;

    /** Serialized JSON array of image URLs */
    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "condition", length = 100)
    private String condition;

    @Column(name = "contact_note", columnDefinition = "TEXT")
    private String contactNote;

    // FK to categories (nullable, SET NULL on delete)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = true,
            foreignKey = @ForeignKey(name = "fk_product_category"))
    private Category categoryRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_product_user"))
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.PENDING;

    /** Lý do từ chối gần nhất (admin moderation) */
    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
