package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.entity.Notification;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Api(tags = "通知接口")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @ApiOperation("我的通知列表")
    @GetMapping
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<PageResult<Notification>> getMyNotifications(
            @RequestParam(required = false) Integer isRead,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.ok();
    }

    @ApiOperation("标记已读")
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<Void> markAsRead(@PathVariable Long id) {
        return Result.ok();
    }

    @ApiOperation("未读数量")
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<Map<String, Integer>> getUnreadCount() {
        return Result.ok();
    }
}
