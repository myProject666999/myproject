package com.nutrition.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("meal_record")
public class MealRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private LocalDate mealDate;

    private String mealType;

    private Long foodId;

    private Integer amount;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
