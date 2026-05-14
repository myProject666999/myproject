package com.fishing.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("leaderboard")
public class Leaderboard {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private BigDecimal totalWeight;
    private BigDecimal totalValue;
    private Integer fishCount;
    private Integer ranking;
    private String period;
    private LocalDate periodDate;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
