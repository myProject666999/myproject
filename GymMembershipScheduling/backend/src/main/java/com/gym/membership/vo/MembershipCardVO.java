package com.gym.membership.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MembershipCardVO {
    private Long id;
    private String cardNo;
    private Long userId;
    private String userName;
    private Long cardTypeId;
    private String cardTypeName;
    private String cardTypeCode;
    private Integer status;
    private String statusName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer remainingTimes;
    private Integer durationDays;
    private Integer totalTimes;
    private BigDecimal price;
}
