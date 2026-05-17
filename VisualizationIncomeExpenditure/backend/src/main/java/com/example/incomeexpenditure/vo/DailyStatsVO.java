package com.example.incomeexpenditure.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DailyStatsVO {
    private LocalDate date;
    private BigDecimal income;
    private BigDecimal expense;
    private Integer count;
    private String holidayName;
    private Integer holidayType;
}
