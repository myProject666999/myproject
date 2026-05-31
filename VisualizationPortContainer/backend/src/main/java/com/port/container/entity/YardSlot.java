package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("yard_slot")
public class YardSlot implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String slotCode;

    private Long yardId;

    private Integer rowNum;

    private Integer bayNum;

    private Integer tierNum;

    private BigDecimal maxWeight;

    private String containerType;

    private Integer status;

    private Long currentContainerId;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
