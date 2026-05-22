package com.runningroute.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.runningroute.entity.Comment;

import java.util.List;

public interface CommentService extends IService<Comment> {
    List<Comment> getCommentsByRouteId(Long routeId);
    boolean addComment(Comment comment);
}
