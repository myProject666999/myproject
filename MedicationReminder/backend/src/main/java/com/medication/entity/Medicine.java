package com.medication.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("medicine")
public class Medicine {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String genericName;

    private String specification;

    private String manufacturer;

    private String category;

    private String description;

    private String image;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
