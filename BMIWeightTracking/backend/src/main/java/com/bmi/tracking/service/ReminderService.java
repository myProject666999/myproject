package com.bmi.tracking.service;

import com.bmi.tracking.entity.Reminder;

import java.time.LocalTime;
import java.util.List;

public interface ReminderService {
    Reminder setReminder(LocalTime reminderTime, Integer enabled);
    Reminder getReminder();
    void toggleEnabled(Integer enabled);
    List<Reminder> listDueReminders(LocalTime time);
}
