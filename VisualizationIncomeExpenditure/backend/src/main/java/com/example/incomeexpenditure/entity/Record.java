package com.example.incomeexpenditure.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Record {
    private Long id;
    private Long userId;
    private Integer type;
    private Long categoryId;
    private BigDecimal amount;
    private LocalDate date;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private String categoryName;
    private String categoryIcon;
}
