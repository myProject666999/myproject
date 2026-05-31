package com.cashflow.dto.forecast;

import java.util.List;

public class ForecastResult {

    private Long currentBalance;
    private List<DailyCashflow> dailyCashflows;
    private Integer warningCount;

    public Long getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(Long currentBalance) {
        this.currentBalance = currentBalance;
    }

    public List<DailyCashflow> getDailyCashflows() {
        return dailyCashflows;
    }

    public void setDailyCashflows(List<DailyCashflow> dailyCashflows) {
        this.dailyCashflows = dailyCashflows;
    }

    public Integer getWarningCount() {
        return warningCount;
    }

    public void setWarningCount(Integer warningCount) {
        this.warningCount = warningCount;
    }
}
