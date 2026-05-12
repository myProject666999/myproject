package com.onsiterepair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("repair_order")
public class RepairOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String orderNo;
    private Long userId;
    private Long workerId;
    private String category;
    private String faultType;
    private String faultDesc;
    private String images;
    private String video;
    private String contactName;
    private String contactPhone;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime appointmentTime;
    private String partsList;
    private BigDecimal partsAmount;
    private BigDecimal laborAmount;
    private BigDecimal totalAmount;
    private BigDecimal negotiatedAmount;
    private String negotiatedNote;
    private Integer negotiationStatus;
    private String beforeImages;
    private String afterImages;
    private String recordingUrl;
    private Integer status;
    private LocalDateTime grabStartTime;
    private LocalDateTime grabEndTime;
    private LocalDateTime acceptTime;
    private LocalDateTime startTime;
    private LocalDateTime finishTime;
    private LocalDateTime cancelTime;
    private String cancelReason;
    private LocalDateTime payTime;
    private String payType;
    private String payTradeNo;
    private Integer warrantyMonths;
    private LocalDateTime warrantyStartTime;
    private LocalDateTime warrantyEndTime;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
