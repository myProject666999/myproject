package com.timestatistics.repository;

import com.timestatistics.entity.TimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimeRecordRepository extends JpaRepository<TimeRecord, Long> {

    List<TimeRecord> findByRecordDateOrderByStartTimeDesc(LocalDate recordDate);

    @Query("SELECT t FROM TimeRecord t WHERE t.recordDate BETWEEN :startDate AND :endDate ORDER BY t.startTime DESC")
    List<TimeRecord> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t.categoryId, SUM(t.duration) FROM TimeRecord t WHERE t.recordDate BETWEEN :startDate AND :endDate GROUP BY t.categoryId")
    List<Object[]> sumDurationByCategoryAndDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT t.recordDate, SUM(t.duration) FROM TimeRecord t WHERE t.recordDate BETWEEN :startDate AND :endDate GROUP BY t.recordDate ORDER BY t.recordDate")
    List<Object[]> sumDurationByDate(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
