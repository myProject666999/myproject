package com.flashcard.repository;

import com.flashcard.entity.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReviewLogRepository extends JpaRepository<ReviewLog, Long> {

    List<ReviewLog> findByCardIdOrderByReviewDateDesc(Long cardId);

    @Query("SELECT COUNT(r) FROM ReviewLog r WHERE r.reviewDate >= :startDate")
    long countReviewsSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(r) FROM ReviewLog r WHERE r.reviewDate BETWEEN :startDate AND :endDate")
    long countReviewsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(r) FROM ReviewLog r WHERE r.quality >= 3 AND r.reviewDate BETWEEN :startDate AND :endDate")
    long countCorrectReviewsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
