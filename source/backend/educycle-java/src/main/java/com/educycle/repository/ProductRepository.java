package com.educycle.repository;

import com.educycle.enums.ProductStatus;
import com.educycle.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    long countByStatus(ProductStatus status);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.user WHERE p.id = :id")
    Optional<Product> findByIdWithUser(UUID id);

    @Query("SELECT p FROM Product p JOIN FETCH p.user WHERE p.status = :status")
    List<Product> findByStatusWithUser(ProductStatus status);

    @Query("SELECT p FROM Product p JOIN FETCH p.user WHERE p.user.id = :userId")
    List<Product> findByUserIdWithUser(UUID userId);

    @Query("SELECT p FROM Product p JOIN FETCH p.user")
    List<Product> findAllWithUser();
}
