
package com.beautyhair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("service_item")
public class ServiceItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String itemName;
    private Long categoryId;
    private String itemCode;
    private java.math.BigDecimal price;
    private java.math.BigDecimal costPrice;
    private Integer duration;
    private String description;
    private Integer status;
    private Integer sort;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String categoryName;
}
