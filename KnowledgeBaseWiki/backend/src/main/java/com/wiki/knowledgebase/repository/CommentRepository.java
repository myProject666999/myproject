package com.wiki.knowledgebase.repository;

import com.wiki.knowledgebase.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByDocumentIdAndStatusOrderByCreatedAtDesc(Long documentId, Integer status);

    List<Comment> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Integer status);

    List<Comment> findByParentIdAndStatusOrderByCreatedAtAsc(Long parentId, Integer status);
}
