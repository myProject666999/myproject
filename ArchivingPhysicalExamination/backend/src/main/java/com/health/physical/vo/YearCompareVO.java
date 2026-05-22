package com.health.physical.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class YearCompareVO implements Serializable {
    private String indicatorName;
    private String valueUnit;
    private BigDecimal currentYearValue;
    private BigDecimal previousYearValue;
    private BigDecimal changeValue;
    private BigDecimal changeRate;
    private String referenceRange;
    private Integer currentResultStatus;
    private Integer previousResultStatus;
    private LocalDate currentExamDate;
    private LocalDate previousExamDate;
}
