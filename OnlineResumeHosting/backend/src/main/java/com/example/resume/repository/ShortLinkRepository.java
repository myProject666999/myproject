package com.example.resume.repository;

import com.example.resume.entity.ShortLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ShortLinkRepository extends JpaRepository<ShortLink, Long> {
    Optional<ShortLink> findByShortCode(String shortCode);
    Optional<ShortLink> findByShortCodeAndExpireAtAfterOrExpireAtIsNull(String shortCode, LocalDateTime now);
    boolean existsByShortCode(String shortCode);
}
