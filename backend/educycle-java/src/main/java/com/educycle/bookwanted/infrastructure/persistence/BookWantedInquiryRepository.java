package com.educycle.bookwanted.infrastructure.persistence;

import com.educycle.bookwanted.domain.BookWantedInquiry;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookWantedInquiryRepository extends JpaRepository<BookWantedInquiry, UUID> {

    @EntityGraph(attributePaths = {"post", "post.user", "responder"})
    @Query("SELECT i FROM BookWantedInquiry i WHERE i.id = :id")
    Optional<BookWantedInquiry> findByIdWithDetails(@Param("id") UUID id);

    @EntityGraph(attributePaths = {"post", "post.user", "responder"})
    Optional<BookWantedInquiry> findByPost_IdAndResponder_Id(UUID postId, UUID responderId);

    @EntityGraph(attributePaths = "responder")
    List<BookWantedInquiry> findByPost_IdOrderByCreatedAtDesc(UUID postId);
}
