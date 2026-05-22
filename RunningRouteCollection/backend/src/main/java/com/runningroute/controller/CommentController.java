package com.runningroute.controller;

import com.runningroute.common.Result;
import com.runningroute.entity.Comment;
import com.runningroute.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/list")
    public Result<List<Comment>> list(@RequestParam Long routeId) {
        return Result.success(commentService.getCommentsByRouteId(routeId));
    }

    @PostMapping("/add")
    public Result<String> add(@RequestBody Comment comment) {
        boolean result = commentService.addComment(comment);
        if (result) {
            return Result.success("评论成功");
        }
        return Result.error("评论失败");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean result = commentService.removeById(id);
        if (result) {
            return Result.success("删除成功");
        }
        return Result.error("删除失败");
    }
}
