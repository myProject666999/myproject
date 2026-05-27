package com.notification.controller;

import com.notification.common.Result;
import com.notification.entity.Comment;
import com.notification.service.CommentService;
import com.notification.utils.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/announcement/{announcementId}")
    public Result<List<Comment>> getComments(@PathVariable Long announcementId) {
        return commentService.getComments(announcementId);
    }

    @PostMapping
    public Result<Comment> addComment(@RequestBody Comment comment) {
        comment.setUserId(UserContext.getUserId());
        comment.setUserName(UserContext.getUsername());
        return commentService.addComment(comment);
    }

    @DeleteMapping("/{id}")
    public Result<?> deleteComment(@PathVariable Long id) {
        Long userId = UserContext.getUserId();
        return commentService.deleteComment(id, userId);
    }
}
