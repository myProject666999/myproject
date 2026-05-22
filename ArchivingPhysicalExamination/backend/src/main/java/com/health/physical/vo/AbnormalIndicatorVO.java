package com.health.physical.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class AbnormalIndicatorVO implements Serializable {
    private Long indicatorId;
    private String indicatorName;
    private String indicatorCode;
    private BigDecimal indicatorValue;
    private String valueUnit;
    private String referenceRange;
    private Integer resultStatus;
    private String description;
    private String suggestion;
    private Integer warningLevel;
}
