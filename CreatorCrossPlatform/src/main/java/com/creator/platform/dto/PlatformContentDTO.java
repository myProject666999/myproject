package com.creator.platform.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PlatformContentDTO {

    private String platformCode;
    private String platformAccountId;
    private String platformContentId;

    private String contentTitle;
    private String contentType;
    private String contentCover;
    private String contentUrl;
    private LocalDateTime publishTime;
    private Integer duration;
    private String tags;

    private Long totalViews;
    private Integer totalLikes;
    private Integer totalComments;
    private Integer totalShares;
    private Integer totalCollects;

    private BigDecimal completeRate;
    private BigDecimal averageWatchTime;
}
