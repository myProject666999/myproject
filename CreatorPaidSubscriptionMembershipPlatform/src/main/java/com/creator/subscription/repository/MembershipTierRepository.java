package com.creator.subscription.repository;

import com.creator.subscription.entity.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipTierRepository extends JpaRepository<MembershipTier, Long> {
    List<MembershipTier> findByCreatorIdAndIsActiveOrderByTierLevelAsc(Long creatorId, Integer isActive);

    List<MembershipTier> findByCreatorIdOrderByTierLevelAsc(Long creatorId);

    @Query("SELECT m FROM MembershipTier m WHERE m.creatorId = :creatorId AND m.tierLevel <= :tierLevel AND m.isActive = 1 ORDER BY m.tierLevel DESC")
    List<MembershipTier> findAccessibleTiers(Long creatorId, Integer tierLevel);

    Optional<MembershipTier> findByCreatorIdAndTierLevel(Long creatorId, Integer tierLevel);
}
