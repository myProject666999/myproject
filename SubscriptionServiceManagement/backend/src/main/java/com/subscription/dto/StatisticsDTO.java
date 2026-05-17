package com.subscription.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class StatisticsDTO {
    private int totalSubscriptions;
    private int activeSubscriptions;
    private BigDecimal totalMonthlyCostCNY;
    private BigDecimal totalYearlyCostCNY;
    private Map<String, BigDecimal> costByCurrency;
    private Map<String, Long> countByCategory;
    private int upcomingRenewalsCount;
    private int overdueSubscriptionsCount;
}
