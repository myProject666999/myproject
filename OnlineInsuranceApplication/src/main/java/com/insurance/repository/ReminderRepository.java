package com.insurance.repository;

import com.insurance.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByStatus(String status);

    List<Reminder> findByType(String type);

    List<Reminder> findByPolicyId(Long policyId);

    @Query("SELECT r FROM Reminder r WHERE r.status = :status AND r.reminderDate <= :reminderDate")
    List<Reminder> findPendingRemindersDueBefore(@Param("status") String status, @Param("reminderDate") LocalDate reminderDate);

    @Query("SELECT r FROM Reminder r WHERE r.reminderDate BETWEEN :startDate AND :endDate")
    List<Reminder> findRemindersBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.status = :status")
    long countByStatus(@Param("status") String status);
}
