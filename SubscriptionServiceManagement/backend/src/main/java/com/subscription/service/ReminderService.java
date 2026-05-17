package com.subscription.service;

import com.subscription.entity.Reminder;
import com.subscription.entity.Subscription;
import com.subscription.repository.ReminderRepository;
import com.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final SubscriptionRepository subscriptionRepository;

    public List<Reminder> getAllPendingReminders() {
        return reminderRepository.findByIsSentFalseOrderByReminderDateAsc();
    }

    public List<Reminder> getRemindersBySubscriptionId(Long subscriptionId) {
        return reminderRepository.findBySubscriptionId(subscriptionId);
    }

    @Transactional
    public Reminder createReminder(Reminder reminder) {
        return reminderRepository.save(reminder);
    }

    @Transactional
    public Optional<Reminder> markAsSent(Long id) {
        return reminderRepository.findById(id)
                .map(reminder -> {
                    reminder.setIsSent(true);
                    return reminderRepository.save(reminder);
                });
    }

    @Transactional
    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void generateReminders() {
        List<Subscription> subscriptions = subscriptionRepository.findSubscriptionsNeedingReminder();
        for (Subscription subscription : subscriptions) {
            LocalDate reminderDate = subscription.getNextRenewalDate().minusDays(subscription.getReminderDays());
            if (!reminderRepository.existsBySubscriptionIdAndReminderDate(subscription.getId(), reminderDate)) {
                Reminder reminder = new Reminder();
                reminder.setSubscriptionId(subscription.getId());
                reminder.setReminderDate(reminderDate);
                reminder.setMessage(String.format("订阅【%s】将在 %d 天后到期，金额：%.2f %s",
                        subscription.getName(),
                        subscription.getReminderDays(),
                        subscription.getPrice(),
                        subscription.getCurrency()));
                reminderRepository.save(reminder);
            }
        }
    }

    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void sendTodayReminders() {
        List<Reminder> reminders = reminderRepository.findRemindersToSend(LocalDate.now());
        for (Reminder reminder : reminders) {
            System.out.println("发送提醒: " + reminder.getMessage());
            reminder.setIsSent(true);
            reminderRepository.save(reminder);
        }
    }
}
