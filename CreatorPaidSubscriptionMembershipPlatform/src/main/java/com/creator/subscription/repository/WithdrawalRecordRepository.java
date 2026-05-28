package com.creator.subscription.repository;

import com.creator.subscription.entity.WithdrawalRecord;
import com.creator.subscription.enums.WithdrawalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WithdrawalRecordRepository extends JpaRepository<WithdrawalRecord, Long> {
    Optional<WithdrawalRecord> findByWithdrawalNo(String withdrawalNo);

    List<WithdrawalRecord> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    Page<WithdrawalRecord> findByCreatorIdOrderByCreatedAtDesc(Long creatorId, Pageable pageable);

    List<WithdrawalRecord> findByStatus(WithdrawalStatus status);

    @Query("SELECT COALESCE(SUM(w.amount), 0) FROM WithdrawalRecord w " +
           "WHERE w.creatorId = :creatorId AND w.status = 'SUCCESS'")
    Long sumSuccessfulWithdrawals(Long creatorId);

    @Query("SELECT COALESCE(SUM(w.actualAmount), 0) FROM WithdrawalRecord w " +
           "WHERE w.status = 'SUCCESS'")
    Long sumTotalWithdrawn();
}
