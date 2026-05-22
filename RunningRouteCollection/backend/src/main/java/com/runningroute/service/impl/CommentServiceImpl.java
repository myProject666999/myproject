package com.runningroute.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.runningroute.entity.Comment;
import com.runningroute.entity.Route;
import com.runningroute.mapper.CommentMapper;
import com.runningroute.service.CommentService;
import com.runningroute.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Autowired
    private RouteService routeService;

    @Override
    public List<Comment> getCommentsByRouteId(Long routeId) {
        QueryWrapper<Comment> wrapper = new QueryWrapper<>();
        wrapper.eq("route_id", routeId);
        wrapper.orderByDesc("create_time");
        return list(wrapper);
    }

    @Override
    public boolean addComment(Comment comment) {
        boolean result = save(comment);
        if (result) {
            Route route = routeService.getById(comment.getRouteId());
            if (route != null) {
                route.setCommentCount(route.getCommentCount() + 1);
                routeService.updateById(route);
            }
        }
        return result;
    }
}
