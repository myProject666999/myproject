package com.chess.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("orders")
public class Orders {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long tableId;
    private Long memberId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal hours;
    private BigDecimal tableFee;
    private BigDecimal productFee;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal payAmount;
    private String paymentMethod;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String tableNo;

    @TableField(exist = false)
    private String memberName;

    @TableField(exist = false)
    private List<OrderItem> orderItems;
}
