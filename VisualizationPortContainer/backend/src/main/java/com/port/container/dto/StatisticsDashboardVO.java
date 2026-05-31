package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class StatisticsDashboardVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer todayContainersIn;

    private Integer todayContainersOut;

    private Integer totalContainersInYard;

    private Integer totalRehandlesToday;

    private BigDecimal rehandleRate;

    private BigDecimal craneUtilizationRate;

    private BigDecimal avgTaskWaitTime;

    private BigDecimal slotUtilizationRate;

    private List<Map<String, Object>> busyTimeDistribution;

    private List<Map<String, Object>> weeklyTrend;

    private List<Map<String, Object>> top5RehandleReasons;
}
