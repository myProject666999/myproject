package com.creator.platform.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class DashboardOverviewVO {

    private Long creatorId;
    private LocalDate statDate;

    private Long totalFans;
    private Long totalFansChange;
    private BigDecimal totalFansGrowthRate;

    private Long totalViews;
    private Long totalViewsChange;
    private BigDecimal totalViewsGrowthRate;

    private Long totalLikes;
    private Long totalLikesChange;

    private Long totalComments;
    private Long totalCommentsChange;

    private Long totalShares;
    private Long totalSharesChange;

    private Long totalCollects;
    private Long totalCollectsChange;

    private BigDecimal avgEngagementRate;
    private BigDecimal avgEngagementRateChange;

    private Integer platformCount;
    private Integer contentCount;

    private List<PlatformMetricsVO> platformMetrics;

    private List<TrendDataVO> fansTrend;
    private List<TrendDataVO> viewsTrend;
}
