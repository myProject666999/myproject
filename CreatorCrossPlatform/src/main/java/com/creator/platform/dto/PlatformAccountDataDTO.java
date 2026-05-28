package com.creator.platform.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlatformAccountDataDTO {

    private String platformCode;
    private String platformAccountId;
    private String platformAccountName;
    private String platformAccountAvatar;

    private Long totalFans;
    private Integer newFans;
    private Integer lostFans;

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
}
