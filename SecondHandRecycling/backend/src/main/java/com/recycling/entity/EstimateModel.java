package com.recycling.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("estimate_model")
public class EstimateModel {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long categoryId;
    private String factorName;
    private String factorType;
    private String options;
    private BigDecimal minValue;
    private BigDecimal maxValue;
    private BigDecimal priceImpact;
    private Integer sort;
    
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
