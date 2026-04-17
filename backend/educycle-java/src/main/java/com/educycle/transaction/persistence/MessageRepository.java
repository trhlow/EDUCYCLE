package com.educycle.transaction.persistence;

import com.educycle.transaction.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.sender " +
           "WHERE m.transaction.id = :transactionId ORDER BY m.createdAt ASC")
    List<Message> findByTransactionId(UUID transactionId);
}
