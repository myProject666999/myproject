package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.entity.Notification;
import com.recruitment.service.NotificationService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Api(tags = "通知接口")
@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @ApiOperation("我的通知列表")
    @GetMapping
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<PageResult<Notification>> getMyNotifications(
            @RequestParam(required = false) Integer isRead,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.ok(notificationService.getMyNotifications(pageNum, pageSize, type));
    }

    @ApiOperation("标记已读")
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return Result.ok();
    }

    @ApiOperation("未读数量")
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<Map<String, Integer>> getUnreadCount() {
        Integer count = notificationService.countUnread();
        Map<String, Integer> result = new HashMap<>();
        result.put("count", count);
        return Result.ok(result);
    }
}