package com.market.stall.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("check_in")
public class CheckIn {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long eventId;

    private Long registrationId;

    private Long userId;

    private Long stallId;

    private LocalDateTime checkInTime;

    private Integer checkInType;

    private String checkInCode;

    private String deviceInfo;

    private String location;

    private Long verifiedBy;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
