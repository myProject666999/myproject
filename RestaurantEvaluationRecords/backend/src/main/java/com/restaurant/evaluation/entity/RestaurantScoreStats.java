package com.restaurant.evaluation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("restaurant_score_stats")
public class RestaurantScoreStats {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long restaurantId;

    private BigDecimal avgTasteScore;

    private BigDecimal avgEnvironmentScore;

    private BigDecimal avgServiceScore;

    private BigDecimal avgOverallScore;

    private Integer reviewCount;

    private BigDecimal repurchaseRate;

    private LocalDateTime updateTime;

}
