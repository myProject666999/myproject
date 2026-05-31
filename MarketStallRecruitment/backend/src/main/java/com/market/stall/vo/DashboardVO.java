package com.market.stall.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DashboardVO {

    private Integer totalEvents;

    private Integer activeEvents;

    private Integer totalRegistrations;

    private BigDecimal totalRevenue;

    private Integer pendingAuditCount;
}
