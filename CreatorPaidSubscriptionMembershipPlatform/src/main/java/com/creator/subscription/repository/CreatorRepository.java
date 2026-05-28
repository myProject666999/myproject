package com.creator.subscription.repository;

import com.creator.subscription.entity.Creator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreatorRepository extends JpaRepository<Creator, Long> {
    Optional<Creator> findByUserId(Long userId);
    Optional<Creator> findByCreatorName(String creatorName);
    boolean existsByUserId(Long userId);

    @Query("SELECT c FROM Creator c WHERE c.status = 1 AND c.isVerified = 1 ORDER BY c.totalSubscribers DESC")
    List<Creator> findTopCreators();

    List<Creator> findByCreatorNameContaining(String keyword);
}
