package com.foodcheckin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("dish")
public class Dish {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long restaurantId;
    private String name;
    private BigDecimal price;
    private String description;
    private BigDecimal avgRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
