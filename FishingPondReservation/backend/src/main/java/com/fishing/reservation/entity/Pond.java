package com.fishing.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("pond")
public class Pond {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String pondNo;
    private String name;
    private String type;
    private BigDecimal pricePerDay;
    private Integer capacity;
    private String description;
    private String imageUrl;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
