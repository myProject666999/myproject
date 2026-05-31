package com.market.stall.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentVO {

    private Long id;

    private String paymentNo;

    private Long registrationId;

    private Long userId;

    private Long eventId;

    private Long stallId;

    private BigDecimal amount;

    private Integer paymentType;

    private Integer paymentMethod;

    private Integer status;

    private LocalDateTime payTime;

    private String refundReason;

    private LocalDateTime refundTime;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private String username;

    private String stallCode;

    private String businessName;

    private String eventName;
}
