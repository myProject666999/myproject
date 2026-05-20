package com.itinerary.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("template_item")
public class TemplateItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long templateId;
    private Long categoryId;
    private String name;
    private String description;
    private Integer defaultQuantity;
    private Integer isRequired;
    private Integer sortOrder;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableLogic
    private Integer deleted;
}
