package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.ParentFeedback;
import com.school.cafeteria.service.ParentFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/feedback")
public class ParentFeedbackController {

    @Autowired
    private ParentFeedbackService parentFeedbackService;

    @GetMapping("/public/list")
    public Result<List<ParentFeedback>> getAll() {
        List<ParentFeedback> list = parentFeedbackService.findAll();
        return Result.success(list);
    }

    @GetMapping("/public/{id}")
    public Result<ParentFeedback> getById(@PathVariable Long id) {
        Optional<ParentFeedback> feedback = parentFeedbackService.findById(id);
        return feedback.map(Result::success).orElse(Result.error("记录不存在"));
    }

    @GetMapping("/public/type/{type}")
    public Result<List<ParentFeedback>> getByType(@PathVariable String type) {
        List<ParentFeedback> list = parentFeedbackService.findByType(type);
        return Result.success(list);
    }

    @GetMapping("/public/status/{status}")
    public Result<List<ParentFeedback>> getByStatus(@PathVariable String status) {
        List<ParentFeedback> list = parentFeedbackService.findByStatus(status);
        return Result.success(list);
    }

    @GetMapping("/public/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = parentFeedbackService.getFeedbackStatistics();
        return Result.success(stats);
    }

    @GetMapping("/public")
    public Result<List<ParentFeedback>> getPublicFeedbacks() {
        List<ParentFeedback> list = parentFeedbackService.findPublicFeedbacks();
        return Result.success(list);
    }

    @PostMapping("/public")
    public Result<ParentFeedback> submit(@RequestBody ParentFeedback feedback) {
        ParentFeedback saved = parentFeedbackService.save(feedback);
        return Result.success("提交成功", saved);
    }

    @PostMapping
    public Result<ParentFeedback> create(@RequestBody ParentFeedback feedback) {
        ParentFeedback saved = parentFeedbackService.save(feedback);
        return Result.success("创建成功", saved);
    }

    @PostMapping("/{id}/reply")
    public Result<ParentFeedback> reply(
            @PathVariable Long id,
            @RequestParam String replyContent,
            @RequestParam String replyPerson) {
        ParentFeedback updated = parentFeedbackService.reply(id, replyContent, replyPerson);
        if (updated == null) {
            return Result.error("记录不存在");
        }
        return Result.success("回复成功", updated);
    }

    @PutMapping("/{id}/status")
    public Result<ParentFeedback> updateStatus(@PathVariable Long id, @RequestParam String status) {
        ParentFeedback updated = parentFeedbackService.updateStatus(id, status);
        if (updated == null) {
            return Result.error("记录不存在");
        }
        return Result.success("状态已更新", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        parentFeedbackService.delete(id);
        return Result.success();
    }
}
