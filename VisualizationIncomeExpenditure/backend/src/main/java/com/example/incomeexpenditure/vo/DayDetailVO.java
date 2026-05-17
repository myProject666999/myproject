package com.example.incomeexpenditure.vo;

import com.example.incomeexpenditure.entity.Record;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DayDetailVO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private List<Record> records;
}
