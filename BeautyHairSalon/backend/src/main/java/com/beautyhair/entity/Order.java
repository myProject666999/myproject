
package com.beautyhair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("`order`")
public class Order {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long memberId;
    private String customerName;
    private String phone;
    private Long appointmentId;
    private java.math.BigDecimal totalAmount;
    private java.math.BigDecimal discountAmount;
    private java.math.BigDecimal pointsDeduction;
    private java.math.BigDecimal payableAmount;
    private java.math.BigDecimal paidAmount;
    private String paymentMethod;
    private Integer pointsEarned;
    private Long storeId;
    private Long operatorId;
    private Integer status;
    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String memberName;

    @TableField(exist = false)
    private String operatorName;
}
