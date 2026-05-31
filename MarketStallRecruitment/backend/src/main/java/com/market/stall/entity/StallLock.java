package com.market.stall.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("stall_lock")
public class StallLock {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long stallId;

    private Long eventId;

    private Long userId;

    private LocalDateTime lockTime;

    private LocalDateTime expireTime;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
