package com.example.water.repository;

import com.example.water.entity.DailySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailySummaryRepository extends JpaRepository<DailySummary, Long> {

    Optional<DailySummary> findBySummaryDate(LocalDate summaryDate);

    List<DailySummary> findBySummaryDateBetweenOrderBySummaryDateAsc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COUNT(d) FROM DailySummary d WHERE d.isAchieved = true AND d.summaryDate BETWEEN :startDate AND :endDate")
    Long countAchievedBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
