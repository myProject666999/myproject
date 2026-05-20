package com.restaurant.evaluation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("restaurant")
public class Restaurant {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String cuisineType;

    private String address;

    private String phone;

    private BigDecimal pricePerPerson;

    private String description;

    private Long createUserId;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

}
