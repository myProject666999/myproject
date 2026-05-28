package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("publish_time_analysis")
public class PublishTimeAnalysis extends BaseEntity {

    private Long creatorId;

    private Long platformId;

    private Integer publishHour;

    private Integer contentCount;

    private BigDecimal avgViews;

    private BigDecimal avgLikes;

    private BigDecimal avgEngagementRate;

    private BigDecimal score;

    private LocalDate statStartDate;

    private LocalDate statEndDate;
}
