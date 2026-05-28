package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("weekly_report")
public class WeeklyReport extends BaseEntity {

    private Long creatorId;

    private String reportType;

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

    private Long topContentViews;

    private BigDecimal fansGrowthRate;

    private BigDecimal viewsGrowthRate;

    private String summary;

    private String suggestions;
}
