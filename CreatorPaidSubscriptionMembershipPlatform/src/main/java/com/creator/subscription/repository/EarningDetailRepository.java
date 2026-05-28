package com.creator.subscription.repository;

import com.creator.subscription.entity.EarningDetail;
import com.creator.subscription.enums.SettlementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EarningDetailRepository extends JpaRepository<EarningDetail, Long> {
    List<EarningDetail> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    Page<EarningDetail> findByCreatorIdOrderByCreatedAtDesc(Long creatorId, Pageable pageable);

    List<EarningDetail> findByCreatorIdAndSettlementStatus(Long creatorId, SettlementStatus settlementStatus);

    @Query("SELECT e FROM EarningDetail e WHERE e.settlementStatus = 'PENDING' " +
           "AND e.createdAt <= :settleTime")
    List<EarningDetail> findPendingEarningsToSettle(LocalDateTime settleTime);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM EarningDetail e " +
           "WHERE e.creatorId = :creatorId AND e.settlementStatus = :status")
    Long sumByCreatorIdAndStatus(Long creatorId, SettlementStatus status);

    @Query("SELECT COALESCE(SUM(e.platformFee), 0) FROM EarningDetail e " +
           "WHERE e.settlementStatus = 'SETTLED'")
    Long sumPlatformFees();
}
