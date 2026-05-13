package com.gym.membership.controller;

import com.gym.membership.common.PageResult;
import com.gym.membership.common.Result;
import com.gym.membership.entity.RenewalReminder;
import com.gym.membership.service.RenewalReminderService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/renewal-reminders")
public class RenewalReminderController {

    private final RenewalReminderService reminderService;

    public RenewalReminderController(RenewalReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<PageResult<RenewalReminder>> getReminderPage(
            @RequestParam(defaultValue = "1") Long pageNum,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        PageResult<RenewalReminder> result = reminderService.getReminderPage(
                pageNum, pageSize, userId, status, startDate, endDate);
        return Result.success(result);
    }

    @PutMapping("/{id}/sent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<Void> markAsSent(@PathVariable Long id) {
        reminderService.markAsSent(id);
        return Result.success("标记成功", null);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> generateReminders() {
        reminderService.generateReminders();
        return Result.success("生成成功", null);
    }
}
