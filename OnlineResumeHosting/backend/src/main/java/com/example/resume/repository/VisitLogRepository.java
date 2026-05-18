package com.example.resume.repository;

import com.example.resume.entity.VisitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {
    List<VisitLog> findByResumeIdOrderByVisitedAtDesc(Long resumeId);

    @Query("SELECT COUNT(v) FROM VisitLog v WHERE v.resumeId = :resumeId AND v.visitedAt BETWEEN :start AND :end")
    Long countByResumeIdAndVisitedAtBetween(Long resumeId, LocalDateTime start, LocalDateTime end);

    void deleteByResumeId(Long resumeId);
}
