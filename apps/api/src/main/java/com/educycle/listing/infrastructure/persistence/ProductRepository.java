package com.educycle.listing.infrastructure.persistence;

import com.educycle.listing.domain.ProductStatus;
import com.educycle.listing.domain.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    long countByStatus(ProductStatus status);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.user WHERE p.id = :id")
    Optional<Product> findByIdWithUser(UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.user WHERE p.id = :id")
    Optional<Product> findByIdWithUserForUpdate(@Param("id") UUID id);

    @Query("SELECT p FROM Product p JOIN FETCH p.user WHERE p.status = :status")
    List<Product> findByStatusWithUser(ProductStatus status);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByUser_Id(UUID userId, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN FETCH p.user WHERE p.user.id = :userId")
    List<Product> findByUserIdWithUser(UUID userId);

    @Query("SELECT p FROM Product p JOIN FETCH p.user")
    List<Product> findAllWithUser();
}
