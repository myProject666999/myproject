package com.subscription.service;

import com.subscription.dto.SubscriptionDTO;
import com.subscription.entity.CycleType;
import com.subscription.entity.Subscription;
import com.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final ExchangeRateService exchangeRateService;

    public List<SubscriptionDTO> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubscriptionDTO> getActiveSubscriptions() {
        return subscriptionRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<SubscriptionDTO> getSubscriptionById(Long id) {
        return subscriptionRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public SubscriptionDTO createSubscription(Subscription subscription) {
        if (subscription.getNextRenewalDate() == null) {
            subscription.setNextRenewalDate(calculateNextRenewalDate(subscription));
        }
        Subscription saved = subscriptionRepository.save(subscription);
        return convertToDTO(saved);
    }

    @Transactional
    public Optional<SubscriptionDTO> updateSubscription(Long id, Subscription subscription) {
        return subscriptionRepository.findById(id)
                .map(existing -> {
                    existing.setName(subscription.getName());
                    existing.setDescription(subscription.getDescription());
                    existing.setCategory(subscription.getCategory());
                    existing.setPrice(subscription.getPrice());
                    existing.setCurrency(subscription.getCurrency());
                    existing.setCycleType(subscription.getCycleType());
                    existing.setCycleDays(subscription.getCycleDays());
                    existing.setStartDate(subscription.getStartDate());
                    existing.setNextRenewalDate(subscription.getNextRenewalDate() != null ?
                            subscription.getNextRenewalDate() : calculateNextRenewalDate(subscription));
                    existing.setIsActive(subscription.getIsActive());
                    existing.setReminderDays(subscription.getReminderDays());
                    existing.setPaymentMethod(subscription.getPaymentMethod());
                    existing.setAccount(subscription.getAccount());
                    return convertToDTO(subscriptionRepository.save(existing));
                });
    }

    @Transactional
    public boolean deleteSubscription(Long id) {
        return subscriptionRepository.findById(id)
                .map(subscription -> {
                    subscriptionRepository.delete(subscription);
                    return true;
                })
                .orElse(false);
    }

    public List<SubscriptionDTO> getUpcomingRenewals(int days) {
        LocalDate now = LocalDate.now();
        LocalDate endDate = now.plusDays(days);
        return subscriptionRepository.findUpcomingRenewals(now, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SubscriptionDTO> getSubscriptionsNeedingReminder() {
        return subscriptionRepository.findSubscriptionsNeedingReminder().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return subscriptionRepository.findDistinctCategories();
    }

    public List<SubscriptionDTO> getByCategory(String category) {
        return subscriptionRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<SubscriptionDTO> renewSubscription(Long id) {
        return subscriptionRepository.findById(id)
                .map(subscription -> {
                    subscription.setNextRenewalDate(calculateNextRenewalDate(subscription));
                    return convertToDTO(subscriptionRepository.save(subscription));
                });
    }

    private LocalDate calculateNextRenewalDate(Subscription subscription) {
        LocalDate baseDate = subscription.getNextRenewalDate() != null ?
                subscription.getNextRenewalDate() : subscription.getStartDate();
        return switch (subscription.getCycleType()) {
            case MONTHLY -> baseDate.plusMonths(1);
            case YEARLY -> baseDate.plusYears(1);
            case CUSTOM -> baseDate.plusDays(subscription.getCycleDays() != null ? subscription.getCycleDays() : 30);
        };
    }

    private BigDecimal calculateMonthlyPrice(Subscription subscription) {
        BigDecimal price = subscription.getPrice();
        return switch (subscription.getCycleType()) {
            case MONTHLY -> price;
            case YEARLY -> price.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            case CUSTOM -> {
                int days = subscription.getCycleDays() != null ? subscription.getCycleDays() : 30;
                yield price.multiply(BigDecimal.valueOf(30))
                        .divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
            }
        };
    }

    private BigDecimal calculateYearlyPrice(Subscription subscription) {
        BigDecimal price = subscription.getPrice();
        return switch (subscription.getCycleType()) {
            case MONTHLY -> price.multiply(BigDecimal.valueOf(12));
            case YEARLY -> price;
            case CUSTOM -> {
                int days = subscription.getCycleDays() != null ? subscription.getCycleDays() : 30;
                yield price.multiply(BigDecimal.valueOf(365))
                        .divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
            }
        };
    }

    private SubscriptionDTO convertToDTO(Subscription subscription) {
        SubscriptionDTO dto = new SubscriptionDTO();
        dto.setId(subscription.getId());
        dto.setName(subscription.getName());
        dto.setDescription(subscription.getDescription());
        dto.setCategory(subscription.getCategory());
        dto.setPrice(subscription.getPrice());
        dto.setCurrency(subscription.getCurrency());
        dto.setCycleType(subscription.getCycleType().name());
        dto.setCycleDays(subscription.getCycleDays());
        dto.setStartDate(subscription.getStartDate());
        dto.setNextRenewalDate(subscription.getNextRenewalDate());
        dto.setIsActive(subscription.getIsActive());
        dto.setReminderDays(subscription.getReminderDays());
        dto.setPaymentMethod(subscription.getPaymentMethod());
        dto.setAccount(subscription.getAccount());
        dto.setMonthlyPrice(calculateMonthlyPrice(subscription));
        dto.setYearlyPrice(calculateYearlyPrice(subscription));
        dto.setPriceInCNY(exchangeRateService.convertToCNY(subscription.getPrice(), subscription.getCurrency()));
        dto.setDaysUntilRenewal(ChronoUnit.DAYS.between(LocalDate.now(), subscription.getNextRenewalDate()));
        return dto;
    }
}
