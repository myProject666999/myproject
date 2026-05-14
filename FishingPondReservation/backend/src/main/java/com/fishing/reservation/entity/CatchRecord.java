package com.fishing.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("catch_record")
public class CatchRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long reservationId;
    private String fishType;
    private BigDecimal weight;
    private BigDecimal pricePerKg;
    private BigDecimal totalPrice;
    private Integer status;
    private LocalDateTime weighTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
