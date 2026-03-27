package com.educycle.repository;

import com.educycle.enums.TransactionStatus;
import com.educycle.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t " +
           "JOIN FETCH t.buyer JOIN FETCH t.seller JOIN FETCH t.product " +
           "WHERE t.id = :id")
    Optional<Transaction> findByIdWithDetails(UUID id);

    @Query("SELECT t FROM Transaction t " +
           "JOIN FETCH t.buyer JOIN FETCH t.seller JOIN FETCH t.product")
    List<Transaction> findAllWithDetails();

    @Query("SELECT t FROM Transaction t " +
           "JOIN FETCH t.buyer JOIN FETCH t.seller JOIN FETCH t.product " +
           "WHERE t.buyer.id = :userId OR t.seller.id = :userId")
    List<Transaction> findByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.status = 'COMPLETED' OR t.status = 'AUTO_COMPLETED'")
    BigDecimal sumCompletedAmount();

    @Query("SELECT t FROM Transaction t " +
           "JOIN FETCH t.buyer JOIN FETCH t.seller JOIN FETCH t.product " +
           "WHERE t.status = :status ORDER BY t.disputedAt DESC NULLS LAST, t.updatedAt DESC")
    List<Transaction> findByStatusWithDetails(@Param("status") TransactionStatus status);

    /** Giao dịch PENDING quá hạn (theo thời điểm tạo yêu cầu). */
    List<Transaction> findByStatusAndCreatedAtBefore(TransactionStatus status, Instant before);

    /** Giao dịch ACCEPTED/MEETING không hoàn tất — theo updatedAt (đứng yên khi chỉ chat). */
    @Query("SELECT t FROM Transaction t WHERE t.status IN :statuses AND t.updatedAt < :before")
    List<Transaction> findByStatusInAndUpdatedAtBefore(
            @Param("statuses") Collection<TransactionStatus> statuses,
            @Param("before") Instant before);
}
