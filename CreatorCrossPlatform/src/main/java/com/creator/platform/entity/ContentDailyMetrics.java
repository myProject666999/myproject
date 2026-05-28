package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("content_daily_metrics")
public class ContentDailyMetrics extends BaseEntity {

    private Long contentId;

    private Long creatorId;

    private Long accountId;

    private Long platformId;

    private LocalDate statDate;

    private Integer dailyViews;

    private Integer dailyLikes;

    private Integer dailyComments;

    private Integer dailyShares;

    private Integer dailyCollects;
}
