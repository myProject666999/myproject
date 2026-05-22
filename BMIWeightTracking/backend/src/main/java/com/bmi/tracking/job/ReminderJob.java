package com.bmi.tracking.job;

import com.bmi.tracking.entity.Reminder;
import com.bmi.tracking.service.ReminderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
public class ReminderJob {

    @Autowired
    private ReminderService reminderService;

    @Scheduled(cron = "0 * * * * ?")
    public void checkReminder() {
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        List<Reminder> reminders = reminderService.listDueReminders(now);
        for (Reminder r : reminders) {
            log.info("提醒用户 {} 记录体重，提醒时间: {}", r.getUserId(), r.getReminderTime());
        }
    }
}
