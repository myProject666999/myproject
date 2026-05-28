package com.creator.subscription.repository;

import com.creator.subscription.entity.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long> {
    Page<Content> findByCreatorIdAndIsPublishedOrderByCreatedAtDesc(Long creatorId, Integer isPublished, Pageable pageable);

    @Query("SELECT c FROM Content c WHERE c.creatorId = :creatorId AND c.isPublished = 1 " +
           "AND (c.minTierLevel = 0 OR c.minTierLevel <= :userTierLevel) " +
           "ORDER BY c.createdAt DESC")
    Page<Content> findAccessibleContents(Long creatorId, Integer userTierLevel, Pageable pageable);

    @Query("SELECT c FROM Content c WHERE c.creatorId = :creatorId AND c.isPublished = 1 " +
           "AND c.minTierLevel <= :userTierLevel " +
           "ORDER BY c.createdAt DESC")
    List<Content> findAccessibleContentsList(Long creatorId, Integer userTierLevel);

    @Query("SELECT c FROM Content c WHERE c.creatorId = :creatorId AND c.isPublished = 1 " +
           "AND (c.scheduledAt IS NULL OR c.scheduledAt <= :now) " +
           "ORDER BY c.createdAt DESC")
    Page<Content> findPublishedContents(Long creatorId, LocalDateTime now, Pageable pageable);

    List<Content> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    long countByCreatorIdAndIsPublished(Long creatorId, Integer isPublished);
}
