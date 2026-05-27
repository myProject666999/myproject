package com.wiki.knowledgebase.controller;

import com.wiki.knowledgebase.entity.Comment;
import com.wiki.knowledgebase.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "评论管理", description = "文档评论相关接口")
@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "获取文档评论列表")
    @GetMapping("/document/{documentId}")
    public ResponseEntity<Map<String, Object>> getComments(@PathVariable Long documentId) {
        List<Comment> comments = commentService.getCommentsByDocument(documentId);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", comments);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "发表评论")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Comment comment,
            @RequestHeader(value = "userId", defaultValue = "1") Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Comment created = commentService.createComment(comment, userId);
            result.put("code", 200);
            result.put("message", "发表成功");
            result.put("data", created);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "删除评论")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            commentService.deleteComment(id);
            result.put("code", 200);
            result.put("message", "删除成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
}
