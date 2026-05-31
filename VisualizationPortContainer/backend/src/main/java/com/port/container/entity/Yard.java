package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("yard")
public class Yard implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String yardCode;

    private String yardName;

    private BigDecimal area;

    private Integer totalSlots;

    private Integer occupiedSlots;

    private Integer maxTiers;

    private Integer rows;

    private Integer bays;

    private Integer status;

    private BigDecimal longitude;

    private BigDecimal latitude;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
