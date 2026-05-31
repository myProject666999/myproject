package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("container")
public class Container implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String containerNo;

    private String containerType;

    private String containerSize;

    private BigDecimal weight;

    private BigDecimal tareWeight;

    private BigDecimal grossWeight;

    private String goodsName;

    private Integer status;

    private Long yardId;

    private Long slotId;

    private String position;

    private LocalDateTime inTime;

    private LocalDateTime outTime;

    private String shipName;

    private String voyageNo;

    private String consignee;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
