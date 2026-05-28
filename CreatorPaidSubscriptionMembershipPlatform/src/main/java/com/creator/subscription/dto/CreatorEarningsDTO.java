package com.creator.subscription.dto;

import lombok.Data;

@Data
public class CreatorEarningsDTO {
    private Long totalEarnings;
    private Long pendingEarnings;
    private Long availableEarnings;
    private Long totalWithdrawn;
    private Integer totalSubscribers;
    private Integer activeSubscribers;
}
