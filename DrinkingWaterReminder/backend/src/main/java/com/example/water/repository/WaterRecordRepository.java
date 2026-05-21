package com.example.water.repository;

import com.example.water.entity.WaterRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaterRecordRepository extends JpaRepository<WaterRecord, Long> {

    List<WaterRecord> findByRecordDateOrderByRecordTimeAsc(LocalDate recordDate);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM WaterRecord w WHERE w.recordDate = :date")
    Integer sumAmountByDate(@Param("date") LocalDate date);

    @Query("SELECT w.recordDate, COALESCE(SUM(w.amount), 0) FROM WaterRecord w WHERE w.recordDate BETWEEN :startDate AND :endDate GROUP BY w.recordDate")
    List<Object[]> sumAmountBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
