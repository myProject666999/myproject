package com.creator.subscription.repository;

import com.creator.subscription.entity.PaymentRecord;
import com.creator.subscription.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    Optional<PaymentRecord> findByOrderNo(String orderNo);

    List<PaymentRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PaymentRecord> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    Page<PaymentRecord> findByCreatorIdOrderByCreatedAtDesc(Long creatorId, Pageable pageable);

    List<PaymentRecord> findBySubscriptionIdOrderByCreatedAtDesc(Long subscriptionId);

    List<PaymentRecord> findByPaymentStatus(PaymentStatus paymentStatus);

    @Query("SELECT COALESCE(SUM(p.creatorEarning), 0) FROM PaymentRecord p " +
           "WHERE p.creatorId = :creatorId AND p.paymentStatus = 'SUCCESS'")
    Long sumCreatorEarnings(Long creatorId);

    @Query("SELECT COALESCE(SUM(p.platformFee), 0) FROM PaymentRecord p " +
           "WHERE p.paymentStatus = 'SUCCESS'")
    Long sumPlatformFees();

    @Query("SELECT p FROM PaymentRecord p WHERE p.creatorId = :creatorId " +
           "AND p.paymentStatus = 'SUCCESS' AND p.paidAt >= :startDate AND p.paidAt <= :endDate")
    List<PaymentRecord> findCreatorEarningsByDateRange(Long creatorId, LocalDateTime startDate, LocalDateTime endDate);
}
