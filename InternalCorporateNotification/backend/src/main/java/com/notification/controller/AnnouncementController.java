package com.notification.controller;

import com.notification.common.PageResult;
import com.notification.common.Result;
import com.notification.entity.Announcement;
import com.notification.entity.User;
import com.notification.service.AnnouncementService;
import com.notification.utils.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @GetMapping
    public Result<PageResult<Announcement>> getList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) String keyword,
            @RequestAttribute(required = false) User user) {

        Long userId = UserContext.getUserId();
        Long departmentId = 1L;
        if (user != null) {
            departmentId = user.getDepartmentId();
        }
        return Result.success(announcementService.getList(pageNum, pageSize, categoryId, type, priority, keyword, userId, departmentId));
    }

    @GetMapping("/{id}")
    public Result<Announcement> getDetail(@PathVariable Long id) {
        Long userId = UserContext.getUserId();
        return announcementService.getDetail(id, userId);
    }

    @PostMapping
    public Result<Announcement> publish(@RequestBody Announcement announcement) {
        Long publisherId = UserContext.getUserId();
        return announcementService.publish(announcement, publisherId);
    }

    @PutMapping("/{id}")
    public Result<Announcement> update(@RequestBody Announcement announcement) {
        announcementService.updateById(announcement);
        return Result.success("更新成功", announcement);
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        return announcementService.delete(id);
    }

    @PutMapping("/{id}/priority")
    public Result<?> updatePriority(@PathVariable Long id, @RequestParam Integer priority) {
        return announcementService.updatePriority(id, priority);
    }

    @GetMapping("/unread-count")
    public Result<Integer> getUnreadCount() {
        Long userId = UserContext.getUserId();
        Long departmentId = 1L;
        return Result.success(announcementService.getUnreadCount(userId, departmentId));
    }
}
