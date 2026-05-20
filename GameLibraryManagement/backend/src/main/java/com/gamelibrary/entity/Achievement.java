package com.gamelibrary.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("achievement")
public class Achievement {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long gameId;

    private String steamApiName;

    private String name;

    private String description;

    private String icon;

    private BigDecimal rarity;

    private LocalDateTime createdAt;
}
