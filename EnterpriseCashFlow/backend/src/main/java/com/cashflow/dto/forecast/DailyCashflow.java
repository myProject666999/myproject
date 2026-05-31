package com.cashflow.dto.forecast;

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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Long getInflow() {
        return inflow;
    }

    public void setInflow(Long inflow) {
        this.inflow = inflow;
    }

    public Long getOutflow() {
        return outflow;
    }

    public void setOutflow(Long outflow) {
        this.outflow = outflow;
    }

    public Long getNetFlow() {
        return netFlow;
    }

    public void setNetFlow(Long netFlow) {
        this.netFlow = netFlow;
    }

    public Long getCumulativeBalance() {
        return cumulativeBalance;
    }

    public void setCumulativeBalance(Long cumulativeBalance) {
        this.cumulativeBalance = cumulativeBalance;
    }
}
