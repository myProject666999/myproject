package com.creator.subscription.service;

import com.creator.subscription.dto.WithdrawRequest;
import com.creator.subscription.entity.Creator;
import com.creator.subscription.entity.WithdrawalRecord;
import com.creator.subscription.enums.SettlementStatus;
import com.creator.subscription.enums.WithdrawalStatus;
import com.creator.subscription.repository.CreatorRepository;
import com.creator.subscription.repository.EarningDetailRepository;
import com.creator.subscription.repository.WithdrawalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WithdrawalService {

    private final WithdrawalRecordRepository withdrawalRecordRepository;
    private final CreatorRepository creatorRepository;
    private final EarningDetailRepository earningDetailRepository;
    private final PlatformConfigService platformConfigService;

    @Transactional
    public WithdrawalRecord createWithdrawal(WithdrawRequest request) {
        Creator creator = creatorRepository.findById(request.getCreatorId())
                .orElseThrow(() -> new RuntimeException("创作者不存在"));

        long minAmount = platformConfigService.getMinWithdrawalAmount();
        if (request.getAmount() < minAmount) {
            throw new RuntimeException("提现金额低于最低限额：" + minAmount);
        }

        if (creator.getAvailableEarnings() < request.getAmount()) {
            throw new RuntimeException("可提现余额不足");
        }

        String withdrawalNo = "WD" + System.currentTimeMillis() +
                UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();

        WithdrawalRecord record = new WithdrawalRecord();
        record.setWithdrawalNo(withdrawalNo);
        record.setCreatorId(request.getCreatorId());
        record.setAmount(request.getAmount());
        record.setFee(0L);
        record.setActualAmount(request.getAmount());
        record.setWithdrawalMethod(request.getWithdrawalMethod());
        record.setAccountInfo(request.getAccountInfo());
        record.setStatus(WithdrawalStatus.PENDING);

        record = withdrawalRecordRepository.save(record);

        creator.setAvailableEarnings(creator.getAvailableEarnings() - request.getAmount());
        creatorRepository.save(creator);

        return record;
    }

    @Transactional
    public void processWithdrawal(Long withdrawalId) {
        WithdrawalRecord record = withdrawalRecordRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("提现记录不存在"));

        if (record.getStatus() != WithdrawalStatus.PENDING) {
            throw new RuntimeException("提现状态不正确");
        }

        record.setStatus(WithdrawalStatus.PROCESSING);
        record.setProcessedAt(LocalDateTime.now());
        withdrawalRecordRepository.save(record);
    }

    @Transactional
    public void completeWithdrawal(Long withdrawalId) {
        WithdrawalRecord record = withdrawalRecordRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("提现记录不存在"));

        if (record.getStatus() != WithdrawalStatus.PROCESSING) {
            throw new RuntimeException("提现状态不正确");
        }

        record.setStatus(WithdrawalStatus.SUCCESS);
        record.setCompletedAt(LocalDateTime.now());
        withdrawalRecordRepository.save(record);

        updateEarningStatus(record);
    }

    @Transactional
    public void failWithdrawal(Long withdrawalId, String remark) {
        WithdrawalRecord record = withdrawalRecordRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("提现记录不存在"));

        if (record.getStatus() == WithdrawalStatus.SUCCESS) {
            throw new RuntimeException("已成功的提现不能失败");
        }

        record.setStatus(WithdrawalStatus.FAILED);
        record.setRemark(remark);
        withdrawalRecordRepository.save(record);

        Creator creator = creatorRepository.findById(record.getCreatorId())
                .orElseThrow(() -> new RuntimeException("创作者不存在"));
        creator.setAvailableEarnings(creator.getAvailableEarnings() + record.getAmount());
        creatorRepository.save(creator);
    }

    private void updateEarningStatus(WithdrawalRecord record) {
        List<com.creator.subscription.entity.EarningDetail> earnings = earningDetailRepository
                .findByCreatorIdAndSettlementStatus(record.getCreatorId(), SettlementStatus.SETTLED);

        long remaining = record.getAmount();
        for (com.creator.subscription.entity.EarningDetail earning : earnings) {
            if (remaining <= 0) break;
            earning.setSettlementStatus(SettlementStatus.WITHDRAWN);
            earningDetailRepository.save(earning);
            remaining -= earning.getAmount();
        }
    }

    public Optional<WithdrawalRecord> getWithdrawalRecord(Long withdrawalId) {
        return withdrawalRecordRepository.findById(withdrawalId);
    }

    public Page<WithdrawalRecord> getCreatorWithdrawals(Long creatorId, Pageable pageable) {
        return withdrawalRecordRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId, pageable);
    }

    public List<WithdrawalRecord> getPendingWithdrawals() {
        return withdrawalRecordRepository.findByStatus(WithdrawalStatus.PENDING);
    }
}
