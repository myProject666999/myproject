package com.court.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("reservation")
public class Reservation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long courtId;
    private LocalDate date;
    private String timeSlot;
    private Double price;
    private String paymentType;
    private Long cardId;
    private Integer status;
    private String qrCode;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}