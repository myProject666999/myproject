package com.foodcheckin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("checkin_dish")
public class CheckinDish {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long checkinId;
    private Long dishId;
    private BigDecimal rating;
    private String comment;
}
