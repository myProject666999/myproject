package com.health.physical.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("exam_indicator")
public class ExamIndicator implements Serializable {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long reportId;

    private Long categoryId;

    private String indicatorName;

    private String indicatorCode;

    private BigDecimal indicatorValue;

    private String valueUnit;

    private String referenceRange;

    private BigDecimal minValue;

    private BigDecimal maxValue;

    private Integer resultStatus;

    private Integer isAbnormal;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
