package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.Reminder;
import com.dental.clinic.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reminders")
@CrossOrigin
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @GetMapping
    public Result<PageResult<Reminder>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Integer sendStatus,
            @RequestParam(required = false) Integer readStatus) {
        Page<Reminder> page = reminderService.page(current, size, patientId, sendStatus, readStatus);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<Reminder>> listByPatientId(@PathVariable Long patientId) {
        List<Reminder> reminders = reminderService.listByPatientId(patientId);
        return Result.success(reminders);
    }

    @GetMapping("/{id}")
    public Result<Reminder> getById(@PathVariable Long id) {
        Reminder reminder = reminderService.getById(id);
        if (reminder == null) {
            return Result.error("提醒不存在");
        }
        return Result.success(reminder);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Reminder reminder) {
        boolean result = reminderService.save(reminder);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @PutMapping("/{id}/read")
    public Result<Boolean> markAsRead(@PathVariable Long id) {
        boolean result = reminderService.markAsRead(id);
        return result ? Result.success(true) : Result.error("操作失败");
    }
}
