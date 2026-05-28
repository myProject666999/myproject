package com.creator.platform.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class WeeklyReportVO {

    private Long reportId;
    private Long creatorId;
    private String reportType;
    private String reportTypeName;

    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Integer weekNum;

    private Long totalFans;
    private Integer weeklyNewFans;
    private Integer weeklyLostFans;
    private Integer weeklyNetFans;

    private Long weeklyViews;
    private Integer weeklyLikes;
    private Integer weeklyComments;
    private Integer weeklyShares;
    private Integer weeklyCollects;

    private BigDecimal weeklyEngagementRate;

    private Long topContentId;
    private String topContentTitle;
    private Long topContentViews;
    private BigDecimal topContentEngagementRate;

    private BigDecimal fansGrowthRate;
    private BigDecimal viewsGrowthRate;

    private String summary;
    private String suggestions;

    private List<PlatformWeeklyMetricsVO> platformMetrics;
    private List<WeeklyTrendVO> dailyTrend;
    private List<ContentRankVO> topContents;
}
