package com.educycle.repository;

import com.educycle.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.user")
    List<Review> findAllWithUser();

    /**
     * Batch query to load reviews for many products in one shot (fixes N+1).
     */
    @Query("SELECT r FROM Review r WHERE r.product.id IN :productIds")
    List<Review> findByProductIdIn(Collection<UUID> productIds);
}
