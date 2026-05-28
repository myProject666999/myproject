package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("emission_factor")
public class EmissionFactor {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String factorCode;

    private String factorName;

    private Integer factorType;

    private String category;

    private String subCategory;

    private String unit;

    private BigDecimal co2Factor;

    private BigDecimal ch4Factor;

    private BigDecimal n2oFactor;

    private BigDecimal totalFactor;

    private String version;

    private String standardSource;

    private String calculationFormula;

    private String description;

    private Integer isCurrent;

    private Integer status;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
