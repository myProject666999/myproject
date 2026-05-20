package com.itinerary.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("itinerary")
public class Itinerary {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Long templateId;
    private Long userId;
    private Integer days;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private String destination;
    private String notes;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
    @TableLogic
    private Integer deleted;
}
