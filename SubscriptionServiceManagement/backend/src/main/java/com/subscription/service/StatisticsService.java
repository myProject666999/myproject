package com.subscription.service;

import com.subscription.dto.StatisticsDTO;
import com.subscription.dto.SubscriptionDTO;
import com.subscription.entity.Subscription;
import com.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final SubscriptionRepository subscriptionRepository;
    private final ExchangeRateService exchangeRateService;

    public StatisticsDTO getStatistics() {
        List<Subscription> allSubscriptions = subscriptionRepository.findAll();
        List<Subscription> activeSubscriptions = subscriptionRepository.findByIsActiveTrue();

        StatisticsDTO stats = new StatisticsDTO();
        stats.setTotalSubscriptions(allSubscriptions.size());
        stats.setActiveSubscriptions(activeSubscriptions.size());

        BigDecimal totalMonthlyCostCNY = BigDecimal.ZERO;
        BigDecimal totalYearlyCostCNY = BigDecimal.ZERO;

        for (Subscription sub : activeSubscriptions) {
            BigDecimal priceInCNY = exchangeRateService.convertToCNY(sub.getPrice(), sub.getCurrency());
            BigDecimal monthlyPrice = calculateMonthlyPrice(sub, priceInCNY);
            BigDecimal yearlyPrice = calculateYearlyPrice(sub, priceInCNY);
            totalMonthlyCostCNY = totalMonthlyCostCNY.add(monthlyPrice);
            totalYearlyCostCNY = totalYearlyCostCNY.add(yearlyPrice);
        }

        stats.setTotalMonthlyCostCNY(totalMonthlyCostCNY);
        stats.setTotalYearlyCostCNY(totalYearlyCostCNY);

        Map<String, BigDecimal> costByCurrency = activeSubscriptions.stream()
                .collect(Collectors.groupingBy(
                        Subscription::getCurrency,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                sub -> exchangeRateService.convertToCNY(sub.getPrice(), sub.getCurrency()),
                                BigDecimal::add
                        )
                ));
        stats.setCostByCurrency(costByCurrency);

        Map<String, Long> countByCategory = activeSubscriptions.stream()
                .filter(sub -> sub.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Subscription::getCategory,
                        Collectors.counting()
                ));
        stats.setCountByCategory(countByCategory);

        LocalDate now = LocalDate.now();
        LocalDate next30Days = now.plusDays(30);
        long upcomingCount = activeSubscriptions.stream()
                .filter(sub -> !sub.getNextRenewalDate().isBefore(now) && sub.getNextRenewalDate().isBefore(next30Days))
                .count();
        stats.setUpcomingRenewalsCount((int) upcomingCount);

        long overdueCount = activeSubscriptions.stream()
                .filter(sub -> sub.getNextRenewalDate().isBefore(now))
                .count();
        stats.setOverdueSubscriptionsCount((int) overdueCount);

        return stats;
    }

    private BigDecimal calculateMonthlyPrice(Subscription subscription, BigDecimal priceInCNY) {
        return switch (subscription.getCycleType()) {
            case MONTHLY -> priceInCNY;
            case YEARLY -> priceInCNY.divide(BigDecimal.valueOf(12), 2, java.math.RoundingMode.HALF_UP);
            case CUSTOM -> {
                int days = subscription.getCycleDays() != null ? subscription.getCycleDays() : 30;
                yield priceInCNY.multiply(BigDecimal.valueOf(30))
                        .divide(BigDecimal.valueOf(days), 2, java.math.RoundingMode.HALF_UP);
            }
        };
    }

    private BigDecimal calculateYearlyPrice(Subscription subscription, BigDecimal priceInCNY) {
        return switch (subscription.getCycleType()) {
            case MONTHLY -> priceInCNY.multiply(BigDecimal.valueOf(12));
            case YEARLY -> priceInCNY;
            case CUSTOM -> {
                int days = subscription.getCycleDays() != null ? subscription.getCycleDays() : 30;
                yield priceInCNY.multiply(BigDecimal.valueOf(365))
                        .divide(BigDecimal.valueOf(days), 2, java.math.RoundingMode.HALF_UP);
            }
        };
    }
}
