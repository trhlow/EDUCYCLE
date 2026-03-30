package com.educycle.repository;

import com.educycle.enums.BookWantedStatus;
import com.educycle.model.BookWantedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface BookWantedPostRepository extends JpaRepository<BookWantedPost, UUID> {

    @EntityGraph(attributePaths = "user")
    @Query("""
            SELECT w FROM BookWantedPost w
            WHERE w.status = :status
              AND (:q IS NULL OR :q = '' OR LOWER(w.title) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR (w.description IS NOT NULL AND LOWER(w.description) LIKE LOWER(CONCAT('%', :q, '%'))))
            """)
    Page<BookWantedPost> findPublicPage(
            @Param("status") BookWantedStatus status,
            @Param("q") String q,
            Pageable pageable);

    @EntityGraph(attributePaths = "user")
    Optional<BookWantedPost> findWithUserById(UUID id);

    @EntityGraph(attributePaths = "user")
    Page<BookWantedPost> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
