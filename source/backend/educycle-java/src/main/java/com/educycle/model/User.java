package com.educycle.model;

import com.educycle.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps C# User entity.
 * Notes:
 *  - Guid → UUID
 *  - DateTime → Instant (UTC)
 *  - Role enum stored as STRING (matches EF HasConversion<string>)
 *  - Implements UserDetails indirectly via UserDetailsServiceImpl
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 200)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "bio")
    private String bio;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // ===== OAuth Fields =====
    @Column(name = "google_id")
    private String googleId;

    @Column(name = "facebook_id")
    private String facebookId;

    @Column(name = "microsoft_id")
    private String microsoftId;

    // ===== Email Verification =====
    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "email_verification_token")
    private String emailVerificationToken;

    @Column(name = "email_verification_token_expiry")
    private Instant emailVerificationTokenExpiry;

    // ===== Password Reset =====
    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_token_expiry")
    private Instant passwordResetTokenExpiry;

    // ===== Phone Verification =====
    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
    private boolean phoneVerified = false;

    /** SHA-256 hex hash of the current opaque refresh token (never store plaintext). */
    @Column(name = "refresh_token", length = 200)
    private String refreshToken;

    @Column(name = "refresh_token_expiry")
    private Instant refreshTokenExpiry;

    /** Nhóm phiên refresh — đổi khi đăng nhập mới; giữ khi rotate token */
    @Column(name = "refresh_token_family")
    private UUID refreshTokenFamily;

    /**
     * SHA-256 hex hash of the immediately-previous refresh token.
     * Used to detect refresh-token replay attacks: if a request arrives with a
     * token matching this hash, the family is invalidated immediately.
     */
    @Column(name = "previous_refresh_token")
    private String previousRefreshToken;

    // ===== Notification preferences (Sprint 3) =====
    @Column(name = "notify_product_moderation", nullable = false)
    @Builder.Default
    private boolean notifyProductModeration = true;

    @Column(name = "notify_transactions", nullable = false)
    @Builder.Default
    private boolean notifyTransactions = true;

    @Column(name = "notify_messages", nullable = false)
    @Builder.Default
    private boolean notifyMessages = true;
}
