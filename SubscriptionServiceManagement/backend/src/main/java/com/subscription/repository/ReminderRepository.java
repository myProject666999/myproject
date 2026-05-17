package com.subscription.repository;

import com.subscription.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByIsSentFalseOrderByReminderDateAsc();

    List<Reminder> findBySubscriptionId(Long subscriptionId);

    @Query("SELECT r FROM Reminder r WHERE r.isSent = false AND r.reminderDate = :date")
    List<Reminder> findRemindersToSend(@Param("date") LocalDate date);

    boolean existsBySubscriptionIdAndReminderDate(Long subscriptionId, LocalDate reminderDate);
}
