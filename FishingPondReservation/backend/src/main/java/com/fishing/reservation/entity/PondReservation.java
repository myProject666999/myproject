package com.fishing.reservation.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("pond_reservation")
public class PondReservation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long pondId;
    private LocalDate reservationDate;
    private BigDecimal price;
    private String paymentType;
    private Integer status;
    private String qrCode;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
