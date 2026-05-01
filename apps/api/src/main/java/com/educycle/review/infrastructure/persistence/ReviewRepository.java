package com.educycle.review.infrastructure.persistence;

import com.educycle.review.domain.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user WHERE r.product.id = :productId")
    List<Review> findByProductId(UUID productId);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user WHERE r.targetUser.id = :targetUserId")
    List<Review> findByTargetUserId(UUID targetUserId);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user WHERE r.transactionId = :transactionId")
    List<Review> findByTransactionId(UUID transactionId);

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user")
    List<Review> findAllWithUser();

    /**
     * Batch query to load reviews for many products in one shot (fixes N+1).
     */
    @Query("SELECT r FROM Review r WHERE r.product.id IN :productIds")
    List<Review> findByProductIdIn(Collection<UUID> productIds);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.targetUser.id = :uid")
    double averageRatingForTargetUser(@Param("uid") UUID uid);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.targetUser.id = :uid")
    long countReviewsForTargetUser(@Param("uid") UUID uid);

    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.targetUser.id = :uid ORDER BY r.createdAt DESC")
    List<Review> findByTargetUserIdOrderByCreatedAtDesc(@Param("uid") UUID uid, Pageable pageable);

    boolean existsByTransactionIdAndUser_IdAndTargetUser_Id(UUID transactionId, UUID userId, UUID targetUserId);
}
