package com.example.resume.repository;

import com.example.resume.entity.ShortLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ShortLinkRepository extends JpaRepository<ShortLink, Long> {
    Optional<ShortLink> findByShortCode(String shortCode);
    
    @Query("SELECT s FROM ShortLink s WHERE s.shortCode = :shortCode AND (s.expireAt IS NULL OR s.expireAt > :now)")
    Optional<ShortLink> findValidShortLink(@Param("shortCode") String shortCode, @Param("now") LocalDateTime now);
    
    boolean existsByShortCode(String shortCode);
}
