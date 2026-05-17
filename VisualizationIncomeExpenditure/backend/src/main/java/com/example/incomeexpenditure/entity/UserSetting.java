package com.example.incomeexpenditure.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserSetting {
    private Long id;
    private Long userId;
    private BigDecimal colorThreshold1;
    private BigDecimal colorThreshold2;
    private BigDecimal colorThreshold3;
    private String color1;
    private String color2;
    private String color3;
    private String color4;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
