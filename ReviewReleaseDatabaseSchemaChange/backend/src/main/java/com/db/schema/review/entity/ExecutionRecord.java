package com.db.schema.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("execution_record")
public class ExecutionRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long executorId;

    private String executorName;

    private String executionType;

    private Integer batchNumber;

    private String status;

    private Integer isPaused;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer duration;

    private String executeLog;

    private String errorMessage;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
