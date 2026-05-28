package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("emission_data")
public class EmissionData {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String dataNo;

    private Long orgId;

    private Integer emissionScope;

    private Integer sourceType;

    private String sourceCategory;

    private String activityName;

    private LocalDate activityDate;

    private String activityMonth;

    private BigDecimal quantity;

    private String unit;

    private Long factorId;

    private String factorVersion;

    private String description;

    private String batchNo;

    private Integer dataSource;

    private Integer status;

    private String auditUser;

    private LocalDateTime auditTime;

    private String auditRemark;

    @TableLogic
    private Integer deleted;

    private String createBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
