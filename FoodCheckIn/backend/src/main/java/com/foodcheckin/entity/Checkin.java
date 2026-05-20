package com.foodcheckin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("checkin")
public class Checkin {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long restaurantId;
    private LocalDate checkinDate;
    private String mealType;
    private BigDecimal totalAmount;
    private BigDecimal overallRating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
