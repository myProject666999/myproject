package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardDataVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer totalYards;

    private Integer totalSlots;

    private Integer occupiedSlots;

    private Integer availableSlots;

    private BigDecimal occupancyRate;

    private Integer totalContainers;

    private Integer inYardContainers;

    private Integer todayInCount;

    private Integer todayOutCount;

    private Integer totalCranes;

    private Integer workingCranes;

    private Integer idleCranes;

    private Integer todayTaskCount;

    private Integer todayCompletedTaskCount;

    private BigDecimal taskCompletionRate;

    private List<YardOverviewVO> yardOverviews;

    private List<CraneLoadInfoVO> craneLoads;
}
