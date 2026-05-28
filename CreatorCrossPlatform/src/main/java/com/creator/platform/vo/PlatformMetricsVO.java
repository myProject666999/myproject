package com.creator.platform.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlatformMetricsVO {

    private Long platformId;
    private String platformCode;
    private String platformName;
    private String platformAccountName;
    private String platformAccountAvatar;

    private Long totalFans;
    private Long newFans;
    private Long lostFans;
    private Long netFans;

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

    private Integer contentCount;
}
