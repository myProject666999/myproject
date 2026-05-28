package com.creator.platform.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlatformWeeklyMetricsVO {

    private Long platformId;
    private String platformCode;
    private String platformName;

    private Long totalFans;
    private Integer weeklyNewFans;
    private Integer weeklyNetFans;
    private Long weeklyViews;
    private Integer weeklyLikes;
    private Integer weeklyComments;
    private Integer weeklyShares;
    private Integer weeklyCollects;
    private BigDecimal weeklyEngagementRate;
    private BigDecimal fansGrowthRate;
    private BigDecimal viewsGrowthRate;
}
