package com.health.appointment.repository;

import com.health.appointment.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDepartmentIdAndScheduleDateBetween(Long departmentId, LocalDate startDate, LocalDate endDate);
    List<Schedule> findByDoctorIdAndScheduleDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);
    List<Schedule> findByDepartmentIdAndStatus(Long departmentId, Integer status);
    List<Schedule> findByDoctorIdAndStatus(Long doctorId, Integer status);

    @Modifying
    @Transactional
    @Query("UPDATE Schedule s SET s.remainingCount = s.remainingCount - 1 WHERE s.id = :scheduleId AND s.remainingCount > 0")
    int decreaseRemainingCount(@Param("scheduleId") Long scheduleId);

    @Modifying
    @Transactional
    @Query("UPDATE Schedule s SET s.remainingCount = s.remainingCount + 1 WHERE s.id = :scheduleId")
    int increaseRemainingCount(@Param("scheduleId") Long scheduleId);
}
