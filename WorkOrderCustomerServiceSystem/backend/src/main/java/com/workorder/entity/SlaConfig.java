package com.workorder.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("sla_config")
public class SlaConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String priority;

    private BigDecimal responseHours;

    private BigDecimal resolveHours;

    private BigDecimal warningHours;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}