package com.market.stall.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("event")
public class Event {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private String coverImage;

    private String address;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationStart;

    private LocalDateTime registrationEnd;

    private Integer status;

    private String mapConfig;

    private String contactPhone;

    private String organizer;

    private Long createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
