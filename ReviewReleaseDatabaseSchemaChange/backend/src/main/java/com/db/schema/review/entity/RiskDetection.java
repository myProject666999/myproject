package com.db.schema.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("risk_detection")
public class RiskDetection {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long orderId;

    private Long sqlId;

    private String riskType;

    private String riskLevel;

    private String riskTitle;

    private String riskDetail;

    private String suggestion;

    private String sqlSnippet;

    private String tableName;

    private LocalDateTime detectedTime;

    private Integer isFixed;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableLogic
    private Integer isDeleted;
}
