package com.court.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("card")
public class Card {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String cardType;
    private String cardNo;
    private Double balance;
    private Integer remainingTimes;
    private LocalDate expireDate;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}