package com.creator.platform.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UnifiedMetricsDTO {

    private Long creatorId;
    private Long accountId;
    private Long platformId;
    private String platformCode;
    private LocalDate statDate;

    private Long totalFans;
    private Integer newFans;
    private Integer lostFans;
    private Integer netFans;

    private Long totalViews;
    private Integer dailyViews;

    private Long totalLikes;
    private Integer dailyLikes;

    private Long totalComments;
    private Integer dailyComments;

    private Long totalShares;
    private Integer dailyShares;

    private Long totalCollects;
    private Integer dailyCollects;

    private BigDecimal engagementRate;
    private BigDecimal playCompletionRate;
    private BigDecimal averageWatchDuration;

    private Long totalInteractions;
    private Integer dailyInteractions;
}
