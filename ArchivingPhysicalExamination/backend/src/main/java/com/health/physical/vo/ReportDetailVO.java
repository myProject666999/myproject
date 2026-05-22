package com.health.physical.vo;

import com.health.physical.entity.ExamIndicator;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class ReportDetailVO implements Serializable {
    private Long id;
    private Long userId;
    private LocalDate examDate;
    private String hospital;
    private String reportNo;
    private String filePath;
    private String fileName;
    private String overallResult;
    private String doctor;
    private String remark;
    private List<ExamIndicator> indicators;
    private Map<String, List<ExamIndicator>> indicatorsByCategory;
    private List<AbnormalIndicatorVO> abnormalIndicators;
}
