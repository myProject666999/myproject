package com.subscription.repository;

import com.subscription.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByIsActiveTrue();

    @Query("SELECT s FROM Subscription s WHERE s.isActive = true AND s.nextRenewalDate BETWEEN :startDate AND :endDate ORDER BY s.nextRenewalDate ASC")
    List<Subscription> findUpcomingRenewals(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT s FROM Subscription s WHERE s.isActive = true AND DATEDIFF(s.nextRenewalDate, CURRENT_DATE) <= s.reminderDays AND DATEDIFF(s.nextRenewalDate, CURRENT_DATE) >= 0 ORDER BY s.nextRenewalDate ASC")
    List<Subscription> findSubscriptionsNeedingReminder();

    List<Subscription> findByCategory(String category);

    @Query("SELECT DISTINCT s.category FROM Subscription s WHERE s.category IS NOT NULL")
    List<String> findDistinctCategories();
}
