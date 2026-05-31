package com.votingscheduling.repository;

import com.votingscheduling.entity.ScheduleSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlot, Long> {
    List<ScheduleSlot> findByScheduleId(Long scheduleId);
    List<ScheduleSlot> findByScheduleIdAndDateBetween(Long scheduleId, LocalDate startDate, LocalDate endDate);
    List<ScheduleSlot> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<ScheduleSlot> findByUserId(Long userId);

    @Query("SELECT s FROM ScheduleSlot s WHERE s.scheduleId = :scheduleId AND s.date = :date AND s.startTime = :startTime AND s.endTime = :endTime")
    Optional<ScheduleSlot> findByUniqueConstraint(@Param("scheduleId") Long scheduleId,
                                                    @Param("date") LocalDate date,
                                                    @Param("startTime") java.time.LocalTime startTime,
                                                    @Param("endTime") java.time.LocalTime endTime);

    @Query("SELECT s FROM ScheduleSlot s WHERE s.userId = :userId AND s.date = :date " +
           "AND ((s.startTime < :endTime) AND (s.endTime > :startTime))")
    List<ScheduleSlot> findConflictingSlots(@Param("userId") Long userId,
                                             @Param("date") LocalDate date,
                                             @Param("startTime") java.time.LocalTime startTime,
                                             @Param("endTime") java.time.LocalTime endTime);
}
