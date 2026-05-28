package com.school.cafeteria.repository;

import com.school.cafeteria.entity.SampleRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SampleRecordRepository extends JpaRepository<SampleRecord, Long> {

    Optional<SampleRecord> findBySampleNo(String sampleNo);

    List<SampleRecord> findBySampleDateOrderBySampleTime(LocalDate sampleDate);

    @Query("SELECT s FROM SampleRecord s WHERE s.sampleDate BETWEEN :startDate AND :endDate ORDER BY s.sampleDate DESC, s.sampleTime DESC")
    List<SampleRecord> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<SampleRecord> findByDishNameContaining(String dishName);
}
