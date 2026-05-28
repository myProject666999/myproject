package com.creator.subscription.repository;

import com.creator.subscription.entity.Subscription;
import com.creator.subscription.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByUserIdAndCreatorId(Long userId, Long creatorId);

    List<Subscription> findByUserId(Long userId);

    List<Subscription> findByCreatorId(Long creatorId);

    List<Subscription> findByStatus(SubscriptionStatus status);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.currentPeriodEnd <= :expiryTime")
    List<Subscription> findExpiringSubscriptions(LocalDateTime expiryTime);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.autoRenew = 1 AND s.currentPeriodEnd <= :renewalTime")
    List<Subscription> findRenewalDueSubscriptions(LocalDateTime renewalTime);

    @Query("SELECT s FROM Subscription s WHERE s.userId = :userId AND s.creatorId = :creatorId AND s.status = 'ACTIVE'")
    Optional<Subscription> findActiveSubscription(Long userId, Long creatorId);

    @Query("SELECT COALESCE(MAX(m.tierLevel), 0) FROM Subscription s " +
           "JOIN MembershipTier m ON s.tierId = m.id " +
           "WHERE s.userId = :userId AND s.creatorId = :creatorId AND s.status = 'ACTIVE'")
    Integer findUserMaxTierLevel(Long userId, Long creatorId);

    long countByCreatorIdAndStatus(Long creatorId, SubscriptionStatus status);
}
