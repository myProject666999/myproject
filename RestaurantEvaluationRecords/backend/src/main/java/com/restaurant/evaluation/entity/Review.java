package com.restaurant.evaluation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("review")
public class Review {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long restaurantId;

    private Long userId;

    private Integer tasteScore;

    private Integer environmentScore;

    private Integer serviceScore;

    private BigDecimal overallScore;

    private Integer repurchaseIntention;

    private String content;

    private LocalDate visitDate;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

}
