package com.creator.platform.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContentRankVO {

    private Long contentId;
    private Long platformId;
    private String platformCode;
    private String platformName;

    private String platformContentId;
    private String contentTitle;
    private String contentType;
    private String contentCover;
    private String contentUrl;
    private LocalDateTime publishTime;
    private Integer publishHour;
    private Integer publishWeekday;
    private Integer duration;
    private String tags;

    private Long totalViews;
    private Integer totalLikes;
    private Integer totalComments;
    private Integer totalShares;
    private Integer totalCollects;

    private BigDecimal completeRate;
    private BigDecimal averageWatchTime;
    private BigDecimal engagementRate;
    private BigDecimal hotValue;

    private Integer rank;
}
