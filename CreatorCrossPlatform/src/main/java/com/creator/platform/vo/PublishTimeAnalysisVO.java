package com.creator.platform.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PublishTimeAnalysisVO {

    private Long creatorId;
    private Long platformId;
    private String platformCode;
    private String platformName;

    private List<HourAnalysisVO> hourAnalysis;

    private Integer bestPublishHour;
    private BigDecimal bestHourScore;
    private Integer bestHourContentCount;
    private BigDecimal bestHourAvgViews;
    private BigDecimal bestHourAvgEngagementRate;

    private List<Integer> recommendedHours;
}
