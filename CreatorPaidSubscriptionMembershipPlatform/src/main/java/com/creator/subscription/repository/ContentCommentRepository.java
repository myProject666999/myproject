package com.creator.subscription.repository;

import com.creator.subscription.entity.ContentComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentCommentRepository extends JpaRepository<ContentComment, Long> {
    List<ContentComment> findByContentIdAndParentIdAndIsDeletedOrderByCreatedAtDesc(Long contentId, Long parentId, Integer isDeleted);

    Page<ContentComment> findByContentIdAndParentIdAndIsDeletedOrderByCreatedAtDesc(Long contentId, Long parentId, Integer isDeleted, Pageable pageable);

    List<ContentComment> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByContentIdAndIsDeleted(Long contentId, Integer isDeleted);
}
