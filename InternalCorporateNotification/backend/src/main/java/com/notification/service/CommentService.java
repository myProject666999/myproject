package com.notification.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.notification.common.Result;
import com.notification.entity.Comment;
import com.notification.mapper.CommentMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CommentService extends ServiceImpl<CommentMapper, Comment> {

    public Result<List<Comment>> getComments(Long announcementId) {
        List<Comment> allComments = this.list(new LambdaQueryWrapper<Comment>()
                .eq(Comment::getAnnouncementId, announcementId)
                .orderByAsc(Comment::getCreateTime));

        Map<Long, Comment> commentMap = allComments.stream()
                .collect(Collectors.toMap(Comment::getId, c -> c));

        List<Comment> roots = new ArrayList<>();
        for (Comment comment : allComments) {
            if (comment.getParentId() == null || comment.getParentId() == 0) {
                roots.add(comment);
            } else {
                Comment parent = commentMap.get(comment.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(comment);
                }
            }
        }
        return Result.success(roots);
    }

    public Result<Comment> addComment(Comment comment) {
        this.save(comment);
        return Result.success("评论成功", comment);
    }

    public Result<?> deleteComment(Long id, Long userId) {
        Comment comment = this.getById(id);
        if (comment == null) {
            return Result.error("评论不存在");
        }
        if (!comment.getUserId().equals(userId)) {
            return Result.error("只能删除自己的评论");
        }
        this.removeById(id);
        return Result.success("删除成功");
    }
}
