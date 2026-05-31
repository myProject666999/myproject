package com.cashflow.dto.forecast;

import lombok.Data;

@Data
public class DailyCashflow {

    private String date;
    private Long inflow;
    private Long outflow;
    private Long netFlow;
    private Long cumulativeBalance;

    public DailyCashflow() {
        this.inflow = 0L;
        this.outflow = 0L;
        this.netFlow = 0L;
    }
}
