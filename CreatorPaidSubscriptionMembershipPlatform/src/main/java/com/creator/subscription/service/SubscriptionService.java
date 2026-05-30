package com.creator.subscription.service;

import com.creator.subscription.dto.SubscribeRequest;
import com.creator.subscription.entity.*;
import com.creator.subscription.enums.*;
import com.creator.subscription.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final EarningDetailRepository earningDetailRepository;
    private final CreatorRepository creatorRepository;
    private final PlatformConfigService platformConfigService;

    @Transactional
    public Subscription createSubscription(SubscribeRequest request) {
        MembershipTier tier = membershipTierRepository.findById(request.getTierId())
                .orElseThrow(() -> new RuntimeException("会员等级不存在"));

        if (!tier.getCreatorId().equals(request.getCreatorId())) {
            throw new RuntimeException("会员等级与创作者不匹配");
        }

        Optional<Subscription> existingOpt = subscriptionRepository
                .findActiveSubscription(request.getUserId(), request.getCreatorId());

        if (existingOpt.isPresent()) {
            return upgradeSubscription(existingOpt.get(), request.getTierId());
        }

        Subscription subscription = new Subscription();
        subscription.setUserId(request.getUserId());
        subscription.setCreatorId(request.getCreatorId());
        subscription.setTierId(request.getTierId());
        subscription.setStatus(SubscriptionStatus.PENDING);
        subscription.setAutoRenew(1);
        subscription.setCurrentPeriodStart(LocalDateTime.now());
        subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        subscription.setCancelAtPeriodEnd(0);

        subscription = subscriptionRepository.save(subscription);

        createPaymentRecord(subscription, tier, request.getPaymentMethod());

        return subscription;
    }

    @Transactional
    public Subscription upgradeSubscription(Subscription subscription, Long newTierId) {
        MembershipTier newTier = membershipTierRepository.findById(newTierId)
                .orElseThrow(() -> new RuntimeException("会员等级不存在"));

        MembershipTier currentTier = membershipTierRepository.findById(subscription.getTierId())
                .orElseThrow(() -> new RuntimeException("当前会员等级不存在"));

        if (newTier.getTierLevel() <= currentTier.getTierLevel()) {
            throw new RuntimeException("只能升级到更高等级");
        }

        subscription.setTierId(newTierId);
        subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        subscription.setUpdatedAt(LocalDateTime.now());

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public void cancelSubscription(Long subscriptionId, boolean immediate) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("订阅不存在"));

        if (immediate) {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscription.setCanceledAt(LocalDateTime.now());
            subscription.setAutoRenew(0);
        } else {
            subscription.setCancelAtPeriodEnd(1);
        }

        subscriptionRepository.save(subscription);
    }

    @Transactional
    public void renewSubscription(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("订阅不存在"));

        if (subscription.getAutoRenew() == 0) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
            return;
        }

        if (subscription.getCancelAtPeriodEnd() == 1) {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscription.setCanceledAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
            return;
        }

        MembershipTier tier = membershipTierRepository.findById(subscription.getTierId())
                .orElseThrow(() -> new RuntimeException("会员等级不存在"));

        subscription.setCurrentPeriodStart(LocalDateTime.now());
        subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));
        subscription.setLastPaymentAmount(tier.getPrice());
        subscription.setLastPaymentAt(LocalDateTime.now());

        createPaymentRecord(subscription, tier, PaymentMethod.CARD);

        subscriptionRepository.save(subscription);
    }

    private void createPaymentRecord(Subscription subscription, MembershipTier tier, PaymentMethod paymentMethod) {
        String orderNo = UUID.randomUUID().toString().replace("-", "").substring(0, 32);

        BigDecimal feeRate = platformConfigService.getFeeRate();
        Long platformFee = tier.getPrice() * feeRate.longValue() / 100;
        Long creatorEarning = tier.getPrice() - platformFee;

        PaymentRecord paymentRecord = new PaymentRecord();
        paymentRecord.setOrderNo(orderNo);
        paymentRecord.setUserId(subscription.getUserId());
        paymentRecord.setCreatorId(subscription.getCreatorId());
        paymentRecord.setSubscriptionId(subscription.getId());
        paymentRecord.setTierId(tier.getId());
        paymentRecord.setAmount(tier.getPrice());
        paymentRecord.setPlatformFee(platformFee);
        paymentRecord.setCreatorEarning(creatorEarning);
        paymentRecord.setFeeRate(feeRate);
        paymentRecord.setPaymentMethod(paymentMethod);
        paymentRecord.setPaymentStatus(PaymentStatus.PENDING);

        paymentRecordRepository.save(paymentRecord);
    }

    @Transactional
    public void processPaymentSuccess(String orderNo) {
        PaymentRecord paymentRecord = paymentRecordRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("支付记录不存在"));

        if (paymentRecord.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return;
        }

        paymentRecord.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRecord.setPaidAt(LocalDateTime.now());
        paymentRecordRepository.save(paymentRecord);

        Subscription subscription = subscriptionRepository.findById(paymentRecord.getSubscriptionId())
                .orElseThrow(() -> new RuntimeException("订阅不存在"));
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setLastPaymentAmount(paymentRecord.getAmount());
        subscription.setLastPaymentAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);

        createEarningDetail(paymentRecord);

        updateCreatorSubscriberCount(paymentRecord.getCreatorId());
    }

    private void createEarningDetail(PaymentRecord paymentRecord) {
        EarningDetail earningDetail = new EarningDetail();
        earningDetail.setCreatorId(paymentRecord.getCreatorId());
        earningDetail.setUserId(paymentRecord.getUserId());
        earningDetail.setSubscriptionId(paymentRecord.getSubscriptionId());
        earningDetail.setPaymentRecordId(paymentRecord.getId());
        earningDetail.setType("SUBSCRIPTION");
        earningDetail.setAmount(paymentRecord.getCreatorEarning());
        earningDetail.setPlatformFee(paymentRecord.getPlatformFee());
        earningDetail.setSettlementStatus(SettlementStatus.PENDING);
        earningDetailRepository.save(earningDetail);

        Creator creator = creatorRepository.findById(paymentRecord.getCreatorId())
                .orElseThrow(() -> new RuntimeException("创作者不存在"));
        creator.setTotalEarnings(creator.getTotalEarnings() + paymentRecord.getCreatorEarning());
        creator.setPendingEarnings(creator.getPendingEarnings() + paymentRecord.getCreatorEarning());
        creatorRepository.save(creator);
    }

    private void updateCreatorSubscriberCount(Long creatorId) {
        long activeCount = subscriptionRepository.countByCreatorIdAndStatus(creatorId, SubscriptionStatus.ACTIVE);
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("创作者不存在"));
        creator.setTotalSubscribers((int) activeCount);
        creatorRepository.save(creator);
    }

    public Optional<Subscription> getUserActiveSubscription(Long userId, Long creatorId) {
        return subscriptionRepository.findActiveSubscription(userId, creatorId);
    }

    public List<Subscription> getUserSubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    public Integer getUserMaxTierLevel(Long userId, Long creatorId) {
        return subscriptionRepository.findUserMaxTierLevel(userId, creatorId);
    }

    @Transactional
    public void processExpiredSubscriptions() {
        LocalDateTime now = LocalDateTime.now();
        List<Subscription> expiring = subscriptionRepository.findExpiringSubscriptions(now);

        for (Subscription subscription : expiring) {
            if (subscription.getAutoRenew() == 1 && subscription.getCancelAtPeriodEnd() == 0) {
                renewSubscription(subscription.getId());
            } else {
                subscription.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(subscription);
                updateCreatorSubscriberCount(subscription.getCreatorId());
            }
        }
    }
}
