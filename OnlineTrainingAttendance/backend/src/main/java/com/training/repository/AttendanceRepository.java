package com.training.repository;

import com.training.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByTrainingId(Long trainingId);

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByTrainingIdAndStudentId(Long trainingId, Long studentId);

    List<Attendance> findByCheckInType(Integer checkInType);

    @Query("SELECT a FROM Attendance a WHERE a.trainingId = :trainingId AND a.checkInTime BETWEEN :start AND :end")
    List<Attendance> findByTrainingIdAndCheckInTimeBetween(
            @Param("trainingId") Long trainingId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Attendance a WHERE a.studentId = :studentId AND a.checkInTime BETWEEN :start AND :end")
    List<Attendance> findByStudentIdAndCheckInTimeBetween(
            @Param("studentId") Long studentId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    long countByTrainingIdAndStudentId(Long trainingId, Long studentId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.trainingId = :trainingId AND FUNCTION('DATE', a.checkInTime) = :date")
    long countByTrainingIdAndDate(@Param("trainingId") Long trainingId, @Param("date") LocalDateTime date);
}
