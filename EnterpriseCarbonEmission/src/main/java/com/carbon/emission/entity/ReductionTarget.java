package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("reduction_target")
public class ReductionTarget {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String targetNo;

    private Long orgId;

    private String targetName;

    private Integer targetType;

    private Integer emissionScope;

    private String baseYear;

    private BigDecimal baseEmission;

    private String targetYear;

    private BigDecimal targetReductionRate;

    private BigDecimal targetEmission;

    private BigDecimal actualEmission;

    private BigDecimal actualReductionRate;

    private BigDecimal achievementRate;

    private String description;

    private String measures;

    private Integer status;

    @TableLogic
    private Integer deleted;

    private String createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
