package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.Reminder;
import com.dental.clinic.mapper.ReminderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private ReminderMapper reminderMapper;

    public Page<Reminder> page(Long current, Long size, Long patientId, Integer sendStatus, Integer readStatus) {
        Page<Reminder> page = new Page<>(current, size);
        LambdaQueryWrapper<Reminder> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(Reminder::getPatientId, patientId);
        }
        if (sendStatus != null) {
            wrapper.eq(Reminder::getSendStatus, sendStatus);
        }
        if (readStatus != null) {
            wrapper.eq(Reminder::getReadStatus, readStatus);
        }
        wrapper.orderByDesc(Reminder::getReminderTime);
        return reminderMapper.selectPage(page, wrapper);
    }

    public Reminder getById(Long id) {
        return reminderMapper.selectById(id);
    }

    public boolean save(Reminder reminder) {
        reminder.setCreateTime(LocalDateTime.now());
        if (reminder.getSendStatus() == null) {
            reminder.setSendStatus(0);
        }
        if (reminder.getReadStatus() == null) {
            reminder.setReadStatus(0);
        }
        return reminderMapper.insert(reminder) > 0;
    }

    public boolean markAsRead(Long id) {
        Reminder reminder = reminderMapper.selectById(id);
        if (reminder == null) return false;
        reminder.setReadStatus(1);
        return reminderMapper.updateById(reminder) > 0;
    }

    public List<Reminder> listByPatientId(Long patientId) {
        LambdaQueryWrapper<Reminder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Reminder::getPatientId, patientId)
               .orderByDesc(Reminder::getReminderTime);
        return reminderMapper.selectList(wrapper);
    }

    @Scheduled(cron = "0 0/30 * * * ?")
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime upcoming = now.plusMinutes(30);
        
        LambdaQueryWrapper<Reminder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Reminder::getSendStatus, 0)
               .ge(Reminder::getReminderTime, now)
               .le(Reminder::getReminderTime, upcoming);
        
        List<Reminder> reminders = reminderMapper.selectList(wrapper);
        
        for (Reminder reminder : reminders) {
            try {
                System.out.println("Sending reminder: " + reminder.getTitle() + " to patient " + reminder.getPatientId());
                reminder.setSendStatus(1);
                reminder.setSentTime(LocalDateTime.now());
                reminderMapper.updateById(reminder);
            } catch (Exception e) {
                System.err.println("Failed to send reminder: " + e.getMessage());
            }
        }
    }
}
