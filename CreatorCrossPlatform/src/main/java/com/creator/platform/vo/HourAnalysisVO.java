package com.creator.platform.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HourAnalysisVO {

    private Integer publishHour;
    private Integer contentCount;
    private BigDecimal avgViews;
    private BigDecimal avgLikes;
    private BigDecimal avgEngagementRate;
    private BigDecimal score;
}
