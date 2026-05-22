package com.health.physical.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IndicatorTrendVO implements Serializable {
    private String indicatorName;
    private String indicatorCode;
    private String valueUnit;
    private BigDecimal minNormal;
    private BigDecimal maxNormal;
    private List<TrendPoint> trendPoints;

    @Data
    public static class TrendPoint implements Serializable {
        private LocalDate examDate;
        private BigDecimal indicatorValue;
        private String referenceRange;
        private Integer resultStatus;
        private Long reportId;
    }
}
