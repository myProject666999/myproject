package com.creator.subscription.service;

import com.creator.subscription.dto.CreatorEarningsDTO;
import com.creator.subscription.entity.Creator;
import com.creator.subscription.entity.EarningDetail;
import com.creator.subscription.enums.SettlementStatus;
import com.creator.subscription.enums.SubscriptionStatus;
import com.creator.subscription.repository.CreatorRepository;
import com.creator.subscription.repository.EarningDetailRepository;
import com.creator.subscription.repository.SubscriptionRepository;
import com.creator.subscription.repository.WithdrawalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EarningService {

    private final EarningDetailRepository earningDetailRepository;
    private final CreatorRepository creatorRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final WithdrawalRecordRepository withdrawalRecordRepository;
    private final PlatformConfigService platformConfigService;

    @Transactional
    public void processSettlement() {
        int settlementDays = platformConfigService.getSettlementDays();
        LocalDateTime settleTime = LocalDateTime.now().minusDays(settlementDays);

        List<EarningDetail> pendingEarnings = earningDetailRepository.findPendingEarningsToSettle(settleTime);

        for (EarningDetail detail : pendingEarnings) {
            detail.setSettlementStatus(SettlementStatus.SETTLED);
            detail.setSettledAt(LocalDateTime.now());
            earningDetailRepository.save(detail);

            Creator creator = creatorRepository.findById(detail.getCreatorId())
                    .orElseThrow(() -> new RuntimeException("创作者不存在"));
            creator.setPendingEarnings(creator.getPendingEarnings() - detail.getAmount());
            creator.setAvailableEarnings(creator.getAvailableEarnings() + detail.getAmount());
            creatorRepository.save(creator);
        }
    }

    public CreatorEarningsDTO getCreatorEarnings(Long creatorId) {
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("创作者不存在"));

        CreatorEarningsDTO dto = new CreatorEarningsDTO();
        dto.setTotalEarnings(creator.getTotalEarnings());
        dto.setPendingEarnings(creator.getPendingEarnings());
        dto.setAvailableEarnings(creator.getAvailableEarnings());
        dto.setTotalSubscribers(creator.getTotalSubscribers());

        long withdrawn = withdrawalRecordRepository.sumSuccessfulWithdrawals(creatorId);
        dto.setTotalWithdrawn(withdrawn);

        long activeSubscribers = subscriptionRepository.countByCreatorIdAndStatus(creatorId, SubscriptionStatus.ACTIVE);
        dto.setActiveSubscribers((int) activeSubscribers);

        return dto;
    }

    public Page<EarningDetail> getEarningDetails(Long creatorId, Pageable pageable) {
        return earningDetailRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId, pageable);
    }

    public List<EarningDetail> getPendingEarnings(Long creatorId) {
        return earningDetailRepository.findByCreatorIdAndSettlementStatus(creatorId, SettlementStatus.PENDING);
    }

    public List<EarningDetail> getSettledEarnings(Long creatorId) {
        return earningDetailRepository.findByCreatorIdAndSettlementStatus(creatorId, SettlementStatus.SETTLED);
    }
}
