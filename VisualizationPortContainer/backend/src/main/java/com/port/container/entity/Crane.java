package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("crane")
public class Crane implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String craneCode;

    private String craneName;

    private String craneType;

    private BigDecimal maxLoad;

    private BigDecimal liftingHeight;

    private BigDecimal workingRadius;

    private Long yardId;

    private String currentPosition;

    private BigDecimal currentX;

    private BigDecimal currentY;

    private Integer status;

    private String operator;

    private LocalDateTime lastMaintenanceTime;

    private LocalDateTime nextMaintenanceTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
