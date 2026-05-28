package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("emission_calculation")
public class EmissionCalculation {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String calculationNo;

    private Long orgId;

    private Integer periodType;

    private String periodValue;

    private Integer emissionScope;

    private Integer sourceType;

    private BigDecimal activityTotal;

    private BigDecimal emissionCo2;

    private BigDecimal emissionCh4;

    private BigDecimal emissionN2o;

    private BigDecimal emissionTotal;

    private String factorVersion;

    private String calculationFormula;

    private String calculationDetail;

    private Integer isSummary;

    private Long parentCalculationId;

    private Integer calculationStatus;

    private String confirmUser;

    private LocalDateTime confirmTime;

    private String remark;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
