package com.creator.subscription.repository;

import com.creator.subscription.entity.ContentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentLikeRepository extends JpaRepository<ContentLike, Long> {
    Optional<ContentLike> findByContentIdAndUserId(Long contentId, Long userId);

    boolean existsByContentIdAndUserId(Long contentId, Long userId);

    void deleteByContentIdAndUserId(Long contentId, Long userId);

    long countByContentId(Long contentId);
}
