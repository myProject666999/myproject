package com.birthdayreminder.controller;

import com.birthdayreminder.common.Result;
import com.birthdayreminder.dto.BirthdayReminderDTO;
import com.birthdayreminder.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reminders")
public class ReminderController {

    @Autowired
    private ContactService contactService;

    @GetMapping("/upcoming")
    public Result<List<BirthdayReminderDTO>> getUpcomingReminders(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "7") int days) {
        return Result.success(contactService.getUpcomingReminders(userId, days));
    }

    @GetMapping("/yearly")
    public Result<List<BirthdayReminderDTO>> getYearlyBirthdayTable(
            @RequestParam Long userId,
            @RequestParam(required = false) Integer year) {
        int y = year != null ? year : java.time.LocalDate.now().getYear();
        return Result.success(contactService.getYearlyBirthdayTable(userId, y));
    }
}
