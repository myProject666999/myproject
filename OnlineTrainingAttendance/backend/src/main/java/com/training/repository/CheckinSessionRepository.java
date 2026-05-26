package com.training.repository;

import com.training.entity.CheckinSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinSessionRepository extends JpaRepository<CheckinSession, Long> {

    Optional<CheckinSession> findBySessionToken(String sessionToken);

    List<CheckinSession> findByTrainingId(Long trainingId);

    List<CheckinSession> findByCreatedBy(Long createdBy);

    List<CheckinSession> findByIsActive(Integer isActive);

    List<CheckinSession> findByTrainingIdAndIsActive(Long trainingId, Integer isActive);

    @Query("SELECT s FROM CheckinSession s WHERE s.trainingId = :trainingId AND s.isActive = 1 AND s.expireTime > :now ORDER BY s.createdAt DESC")
    List<CheckinSession> findActiveSessionsByTrainingId(
            @Param("trainingId") Long trainingId,
            @Param("now") LocalDateTime now);

    @Query("SELECT s FROM CheckinSession s WHERE s.sessionToken = :sessionToken AND s.isActive = 1 AND s.expireTime > :now")
    Optional<CheckinSession> findValidBySessionToken(
            @Param("sessionToken") String sessionToken,
            @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(s) FROM CheckinSession s WHERE s.expireTime <= :now AND s.isActive = 1")
    long countExpiredActiveSessions(@Param("now") LocalDateTime now);
}
