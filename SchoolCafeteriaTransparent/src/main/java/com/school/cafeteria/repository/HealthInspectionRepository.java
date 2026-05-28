package com.school.cafeteria.repository;

import com.school.cafeteria.entity.HealthInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthInspectionRepository extends JpaRepository<HealthInspection, Long> {

    Optional<HealthInspection> findByInspectionNo(String inspectionNo);

    List<HealthInspection> findByRectifyStatus(String rectifyStatus);

    List<HealthInspection> findByInspectionType(String inspectionType);

    @Query("SELECT h FROM HealthInspection h WHERE h.inspectionDate BETWEEN :startDate AND :endDate ORDER BY h.inspectionDate DESC")
    List<HealthInspection> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(h) FROM HealthInspection h WHERE h.rectifyStatus = :status")
    Long countByRectifyStatus(@Param("status") String status);
}
