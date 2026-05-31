package com.db.schema.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("schema_order_sql")
public class SchemaOrderSql {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private String sqlContent;

    private String sqlType;

    private String tableName;

    private Long estimatedRows;

    private Integer sortOrder;

    private Integer batchNumber;

    private String status;

    private String executeResult;

    private Long affectedRows;

    private LocalDateTime executeTime;

    private Integer executeDuration;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer isDeleted;
}
