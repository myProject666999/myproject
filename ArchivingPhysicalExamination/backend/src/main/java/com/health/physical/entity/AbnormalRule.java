package com.health.physical.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("abnormal_rule")
public class AbnormalRule implements Serializable {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String indicatorName;

    private String indicatorCode;

    private Long categoryId;

    private BigDecimal minNormal;

    private BigDecimal maxNormal;

    private String unit;

    private Integer warningLevel;

    private String description;

    private String suggestion;

    private Integer isActive;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
