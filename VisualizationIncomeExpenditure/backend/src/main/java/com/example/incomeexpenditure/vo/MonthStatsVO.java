package com.example.incomeexpenditure.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MonthStatsVO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private Integer incomeCount;
    private Integer expenseCount;
}
