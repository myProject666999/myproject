package com.db.schema.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("schema_order")
public class SchemaOrder {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private String title;

    private String description;

    private Long envId;

    private String dbName;

    private Long applicantId;

    private String applicantName;

    private String status;

    private String priority;

    private String changeType;

    private String riskLevel;

    private Integer isGray;

    private Integer batchCount;

    private Integer currentBatch;

    private String rollbackSql;

    private LocalDateTime planExecuteTime;

    private LocalDateTime actualExecuteTime;

    private LocalDateTime finishTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
