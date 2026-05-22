package com.bmi.tracking.controller;

import com.bmi.tracking.common.Result;
import com.bmi.tracking.entity.Reminder;
import com.bmi.tracking.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/reminder")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @PostMapping
    public Result<Reminder> setReminder(@RequestBody Map<String, Object> body) {
        LocalTime time = body.get("reminderTime") != null
                ? LocalTime.parse(body.get("reminderTime").toString())
                : LocalTime.of(8, 0);
        Integer enabled = body.get("enabled") != null
                ? ((Number) body.get("enabled")).intValue()
                : 1;
        return Result.success(reminderService.setReminder(time, enabled));
    }

    @GetMapping
    public Result<Reminder> getReminder() {
        return Result.success(reminderService.getReminder());
    }

    @PutMapping("/toggle")
    public Result<Void> toggle(@RequestBody Map<String, Integer> body) {
        reminderService.toggleEnabled(body.get("enabled"));
        return Result.success();
    }
}
