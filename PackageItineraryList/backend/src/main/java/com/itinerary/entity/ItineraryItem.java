package com.itinerary.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("itinerary_item")
public class ItineraryItem {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long itineraryId;
    private Long templateItemId;
    private Long categoryId;
    private String name;
    private String description;
    private Integer quantity;
    private Integer isChecked;
    private LocalDateTime checkedAt;
    private Integer isCustom;
    private Integer sortOrder;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
