package com.market.stall.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("payment")
public class Payment {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String paymentNo;

    private Long registrationId;

    private Long userId;

    private Long eventId;

    private Long stallId;

    private BigDecimal amount;

    private Integer paymentType;

    private Integer paymentMethod;

    private Integer status;

    private LocalDateTime payTime;

    private String refundReason;

    private LocalDateTime refundTime;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
