package com.carbon.emission.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("esg_indicator")
public class EsgIndicator {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String indicatorCode;

    private String indicatorName;

    private Integer dimension;

    private String category;

    private Integer indicatorType;

    private String unit;

    private String standard;

    private String calculationMethod;

    private String dataSource;

    private String description;

    private Integer sortOrder;

    private Integer status;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
