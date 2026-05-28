package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("content_metrics")
public class ContentMetrics extends BaseEntity {

    private Long contentId;

    private Long creatorId;

    private Long accountId;

    private Long platformId;

    private Long totalViews;

    private Integer totalLikes;

    private Integer totalComments;

    private Integer totalShares;

    private Integer totalCollects;

    private BigDecimal completeRate;

    private BigDecimal averageWatchTime;

    private BigDecimal engagementRate;

    private BigDecimal hotValue;

    private LocalDateTime lastUpdateTime;
}
