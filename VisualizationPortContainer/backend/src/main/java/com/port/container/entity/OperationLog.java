package com.port.container.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("operation_log")
public class OperationLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String logNo;

    private String module;

    private String operationType;

    private Long taskId;

    private String taskNo;

    private Long containerId;

    private String containerNo;

    private Long craneId;

    private String craneCode;

    private Long operatorId;

    private String operatorName;

    private String sourcePosition;

    private String targetPosition;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer duration;

    private Integer status;

    private String result;

    private String errorMsg;

    private String ipAddress;

    private String userAgent;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
