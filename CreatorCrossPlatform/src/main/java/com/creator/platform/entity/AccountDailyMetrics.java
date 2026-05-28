package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("account_daily_metrics")
public class AccountDailyMetrics extends BaseEntity {

    private Long creatorId;

    private Long accountId;

    private Long platformId;

    private LocalDate statDate;

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
