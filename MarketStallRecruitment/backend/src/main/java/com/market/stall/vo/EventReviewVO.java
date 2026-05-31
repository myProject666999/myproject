package com.market.stall.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class EventReviewVO {

    private Long eventId;

    private String eventTitle;

    private Integer totalRegistrations;

    private Integer approvedRegistrations;

    private Integer totalStalls;

    private Integer occupiedStalls;

    private BigDecimal totalRevenue;

    private BigDecimal totalRefund;

    private Integer checkInCount;

    private BigDecimal checkInRate;

    private Map<String, Integer> businessTypeDistribution;
}
