package com.recycling.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("appointment_order")
public class AppointmentOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String orderNo;
    private Long userId;
    private Long addressId;
    private Long categoryId;
    private Long collectorId;
    private BigDecimal quantity;
    private BigDecimal estimatedPrice;
    private BigDecimal finalPrice;
    private String description;
    private String images;
    private LocalDateTime appointmentTime;
    private String status;
    private String cancelReason;
    
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
