package com.cashflow.dto.forecast;

import lombok.Data;

import java.util.List;

@Data
public class ForecastResult {

    private Long currentBalance;
    private List<DailyCashflow> dailyCashflows;
    private Integer warningCount;
}
