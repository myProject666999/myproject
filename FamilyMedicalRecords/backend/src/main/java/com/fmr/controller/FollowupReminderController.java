package com.fmr.controller;

import com.fmr.common.Result;
import com.fmr.entity.FollowupReminder;
import com.fmr.service.FollowupReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reminders")
public class FollowupReminderController {

    @Autowired
    private FollowupReminderService followupReminderService;

    @GetMapping
    public Result<List<FollowupReminder>> list(
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from != null && to != null) {
            return Result.ok(followupReminderService.listUpcoming(from, to));
        }
        if (memberId != null) {
            return Result.ok(followupReminderService.listByMemberId(memberId));
        }
        return Result.ok(followupReminderService.list());
    }

    @PutMapping("/{id}/status")
    public Result<String> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        followupReminderService.markStatus(id, status);
        return Result.ok("状态更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        followupReminderService.removeById(id);
        return Result.ok("删除成功");
    }
}
