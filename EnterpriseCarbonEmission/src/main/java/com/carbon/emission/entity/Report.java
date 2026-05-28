package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("report")
public class Report {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String reportNo;

    private String reportName;

    private Integer reportType;

    private Long orgId;

    private Long templateId;

    private Integer periodType;

    private String periodValue;

    private String reportStandard;

    private Integer version;

    private Long parentReportId;

    private String reportFile;

    private String reportContent;

    private BigDecimal totalEmission;

    private BigDecimal scope1Emission;

    private BigDecimal scope2Emission;

    private BigDecimal scope3Emission;

    private BigDecimal esgScore;

    private Integer reportStatus;

    private LocalDateTime publishTime;

    private String auditUser;

    private LocalDateTime auditTime;

    private String approver;

    private LocalDateTime approveTime;

    private String remark;

    @TableLogic
    private Integer deleted;

    private String createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
