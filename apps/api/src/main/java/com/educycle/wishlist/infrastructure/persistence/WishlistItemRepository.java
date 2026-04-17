package com.educycle.wishlist.infrastructure.persistence;

import com.educycle.wishlist.domain.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {

    @Query("""
            SELECT w FROM WishlistItem w
            JOIN FETCH w.product p
            JOIN FETCH p.user seller
            WHERE w.user.id = :userId
            ORDER BY w.createdAt DESC
            """)
    List<WishlistItem> findByUserIdWithProduct(@Param("userId") UUID userId);

    Optional<WishlistItem> findByUser_IdAndProduct_Id(UUID userId, UUID productId);

    void deleteByUser_IdAndProduct_Id(UUID userId, UUID productId);

    boolean existsByUser_IdAndProduct_Id(UUID userId, UUID productId);
}
