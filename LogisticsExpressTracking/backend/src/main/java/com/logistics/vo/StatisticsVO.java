package com.logistics.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class StatisticsVO implements Serializable {
    private Long totalWaybillCount;
    private Long pendingCount;
    private Long inTransitCount;
    private Long deliveringCount;
    private Long deliveredCount;
    private Long todayNewCount;
    private Long todayDeliveredCount;
}
