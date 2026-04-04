package com.educycle.repository;

import com.educycle.model.BookWantedInquiryMessage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookWantedInquiryMessageRepository extends JpaRepository<BookWantedInquiryMessage, UUID> {

    @EntityGraph(attributePaths = "sender")
    List<BookWantedInquiryMessage> findByInquiry_IdOrderByCreatedAtAsc(UUID inquiryId);
}
