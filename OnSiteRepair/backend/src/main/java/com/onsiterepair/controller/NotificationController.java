package com.onsiterepair.controller;

import com.onsiterepair.common.Result;
import com.onsiterepair.entity.Notification;
import com.onsiterepair.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/list")
    public Result<List<Notification>> list(
            @RequestAttribute("userType") Integer userType,
            @RequestAttribute("userId") Long userId) {
        return Result.success(notificationService.getUserNotifications(userType, userId));
    }

    @GetMapping("/unread-count")
    public Result<Integer> getUnreadCount(
            @RequestAttribute("userType") Integer userType,
            @RequestAttribute("userId") Long userId) {
        return Result.success(notificationService.getUnreadCount(userType, userId));
    }

    @PostMapping("/read/{id}")
    public Result<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return Result.success();
    }
}
