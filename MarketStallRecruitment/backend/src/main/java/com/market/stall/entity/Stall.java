package com.market.stall.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("stall")
public class Stall {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long eventId;

    private String stallCode;

    private String stallName;

    private String zone;

    private Integer rowNum;

    private Integer colNum;

    private Integer stallType;

    private BigDecimal areaSize;

    private BigDecimal price;

    private Integer status;

    private String facilities;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
