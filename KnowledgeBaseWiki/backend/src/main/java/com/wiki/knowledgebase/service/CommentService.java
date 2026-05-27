package com.wiki.knowledgebase.service;

import com.wiki.knowledgebase.entity.Comment;
import com.wiki.knowledgebase.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public List<Comment> getCommentsByDocument(Long documentId) {
        return commentRepository.findByDocumentIdAndStatusOrderByCreatedAtDesc(documentId, 1);
    }

    @Transactional
    public Comment createComment(Comment comment, Long userId) {
        comment.setUserId(userId);
        comment.setStatus(1);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        comment.setStatus(0);
        commentRepository.save(comment);
    }
}
