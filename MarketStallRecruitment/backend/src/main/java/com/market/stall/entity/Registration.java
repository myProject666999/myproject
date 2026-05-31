package com.market.stall.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("registration")
public class Registration {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long eventId;

    private Long userId;

    private Long stallId;

    private String businessName;

    private Integer businessType;

    private String businessDesc;

    private String businessImages;

    private String idCardNumber;

    private String contactPhone;

    private Integer auditStatus;

    private String auditRemark;

    private Long auditBy;

    private LocalDateTime auditTime;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
