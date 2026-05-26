package com.health.appointment.repository;

import com.health.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByCreatedTimeDesc(Long patientId);
    List<Appointment> findByScheduleIdOrderByQueueNumberAsc(Long scheduleId);
    List<Appointment> findByPatientIdAndScheduleDate(Long patientId, LocalDate scheduleDate);

    @Query("SELECT COALESCE(MAX(a.queueNumber), 0) FROM Appointment a WHERE a.scheduleId = :scheduleId")
    Integer findMaxQueueNumberByScheduleId(@Param("scheduleId") Long scheduleId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patientId = :patientId AND a.scheduleDate = :scheduleDate AND a.status IN (1, 2)")
    Long countByPatientIdAndScheduleDate(@Param("patientId") Long patientId, @Param("scheduleDate") LocalDate scheduleDate);

    boolean existsByPatientIdAndScheduleIdAndStatusIn(Long patientId, Long scheduleId, List<Integer> statuses);
}
