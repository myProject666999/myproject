package com.restaurant.evaluation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("recommended_dish")
public class RecommendedDish {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long restaurantId;

    private Long userId;

    private String dishName;

    private String description;

    private Integer recommendCount;

    private LocalDateTime createTime;

}
