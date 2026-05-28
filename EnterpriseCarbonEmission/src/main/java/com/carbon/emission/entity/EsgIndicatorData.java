package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("esg_indicator_data")
public class EsgIndicatorData {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long indicatorId;

    private Long orgId;

    private Integer periodType;

    private String periodValue;

    private BigDecimal indicatorValue;

    private String indicatorText;

    private String supportingDocument;

    private Integer status;

    private String auditUser;

    private LocalDateTime auditTime;

    private String auditRemark;

    private String remark;

    @TableLogic
    private Integer deleted;

    private String createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
