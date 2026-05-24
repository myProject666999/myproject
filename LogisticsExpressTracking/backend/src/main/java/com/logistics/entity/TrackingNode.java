package com.logistics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_tracking_node")
public class TrackingNode {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long waybillId;

    private String waybillNo;

    private Integer nodeType;

    private String location;

    private String description;

    private String operator;

    private String operatorPhone;

    private LocalDateTime nodeTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
