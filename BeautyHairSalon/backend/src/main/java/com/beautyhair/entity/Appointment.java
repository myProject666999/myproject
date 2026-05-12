
package com.beautyhair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("appointment")
public class Appointment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String appointmentNo;
    private Long memberId;
    private String customerName;
    private String phone;
    private LocalDate appointmentDate;
    private String appointmentTime;
    private Long technicianId;
    private Long serviceItemId;
    private String serviceName;
    private Integer estimatedDuration;
    private java.math.BigDecimal estimatedAmount;
    private Integer status;
    private String source;
    private Long storeId;
    private Long operatorId;
    private String remark;
    private LocalDateTime arriveTime;
    private String cancelReason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String technicianName;

    @TableField(exist = false)
    private String memberName;
}
