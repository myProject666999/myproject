package com.nutrition.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("nutrition_goal")
public class NutritionGoal {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Integer targetCalories;

    private Integer targetProtein;

    private Integer targetFat;

    private Integer targetCarbs;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
