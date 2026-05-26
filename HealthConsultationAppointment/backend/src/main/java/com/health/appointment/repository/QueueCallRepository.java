package com.health.appointment.repository;

import com.health.appointment.entity.QueueCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueCallRepository extends JpaRepository<QueueCall, Long> {
    List<QueueCall> findByScheduleIdAndDoctorIdOrderByQueueNumberAsc(Long scheduleId, Long doctorId);
    List<QueueCall> findByScheduleIdAndDoctorIdAndStatusOrderByQueueNumberAsc(Long scheduleId, Long doctorId, Integer status);
    Optional<QueueCall> findByAppointmentId(Long appointmentId);

    @Query("SELECT q FROM QueueCall q WHERE q.scheduleId = :scheduleId AND q.doctorId = :doctorId AND q.status IN (0, 1) ORDER BY q.queueNumber ASC LIMIT 1")
    Optional<QueueCall> findNextToCall(@Param("scheduleId") Long scheduleId, @Param("doctorId") Long doctorId);
}
