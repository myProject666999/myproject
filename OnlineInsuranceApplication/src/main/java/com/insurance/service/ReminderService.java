package com.insurance.service;

import com.insurance.entity.Reminder;
import com.insurance.repository.ReminderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ReminderService {
    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);

    @Autowired
    private ReminderRepository reminderRepository;

    public List<Reminder> getAllReminders() {
        return reminderRepository.findAll();
    }

    public List<Reminder> getRemindersByStatus(String status) {
        return reminderRepository.findByStatus(status);
    }

    public List<Reminder> getRemindersByType(String type) {
        return reminderRepository.findByType(type);
    }

    public List<Reminder> getRemindersByPolicyId(Long policyId) {
        return reminderRepository.findByPolicyId(policyId);
    }

    public List<Reminder> getUpcomingReminders(int days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(days);
        return reminderRepository.findRemindersBetween(startDate, endDate);
    }

    public Optional<Reminder> getReminderById(Long id) {
        return reminderRepository.findById(id);
    }

    @Transactional
    public Reminder markAsSent(Long id) {
        return reminderRepository.findById(id)
                .map(reminder -> {
                    reminder.setStatus("SENT");
                    reminder.setSentAt(LocalDate.now());
                    return reminderRepository.save(reminder);
                })
                .orElseThrow(() -> new RuntimeException("Reminder not found with id " + id));
    }

    @Transactional
    public Reminder markAsRead(Long id) {
        return reminderRepository.findById(id)
                .map(reminder -> {
                    reminder.setStatus("READ");
                    return reminderRepository.save(reminder);
                })
                .orElseThrow(() -> new RuntimeException("Reminder not found with id " + id));
    }

    @Transactional
    @Scheduled(cron = "0 0 8 * * ?")
    public void sendDueReminders() {
        logger.info("Starting scheduled reminder check...");
        LocalDate today = LocalDate.now();
        List<Reminder> dueReminders = reminderRepository.findPendingRemindersDueBefore("PENDING", today);

        for (Reminder reminder : dueReminders) {
            try {
                sendReminder(reminder);
                reminder.setStatus("SENT");
                reminder.setSentAt(today);
                reminderRepository.save(reminder);
                logger.info("Sent reminder: {} - {}", reminder.getType(), reminder.getTitle());
            } catch (Exception e) {
                logger.error("Failed to send reminder {}: {}", reminder.getId(), e.getMessage());
            }
        }
        logger.info("Completed scheduled reminder check. Processed {} reminders.", dueReminders.size());
    }

    private void sendReminder(Reminder reminder) {
        logger.info("========================================");
        logger.info("提醒类型: {}", reminder.getType());
        logger.info("提醒标题: {}", reminder.getTitle());
        logger.info("提醒内容: {}", reminder.getMessage());
        logger.info("提醒日期: {}", reminder.getReminderDate());
        logger.info("========================================");
    }

    public long getPendingReminderCount() {
        return reminderRepository.countByStatus("PENDING");
    }
}
