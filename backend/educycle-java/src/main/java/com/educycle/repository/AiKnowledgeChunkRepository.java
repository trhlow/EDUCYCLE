package com.educycle.repository;

import com.educycle.model.AiKnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiKnowledgeChunkRepository extends JpaRepository<AiKnowledgeChunk, UUID> {

    List<AiKnowledgeChunk> findByEmbeddingIsNotNull();
}
