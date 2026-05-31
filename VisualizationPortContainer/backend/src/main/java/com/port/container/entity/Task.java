package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("task")
public class Task implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String taskNo;

    private String taskType;

    private Integer priority;

    private Long containerId;

    private String containerNo;

    private Long sourceSlotId;

    private String sourcePosition;

    private Long targetSlotId;

    private String targetPosition;

    private Long craneId;

    private String craneCode;

    private Long operatorId;

    private String operatorName;

    private Integer status;

    private LocalDateTime assignTime;

    private LocalDateTime startTime;

    private LocalDateTime completeTime;

    private Integer progress;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
