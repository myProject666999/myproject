package com.subscription.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SubscriptionDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private String currency;
    private String cycleType;
    private Integer cycleDays;
    private LocalDate startDate;
    private LocalDate nextRenewalDate;
    private Boolean isActive;
    private Integer reminderDays;
    private String paymentMethod;
    private String account;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private BigDecimal priceInCNY;
    private Long daysUntilRenewal;
}
