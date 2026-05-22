package com.health.physical.vo;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class ReportListVO implements Serializable {
    private Long id;
    private Long userId;
    private LocalDate examDate;
    private String hospital;
    private String reportNo;
    private String fileName;
    private String overallResult;
    private Integer abnormalCount;
    private Integer indicatorCount;
}
