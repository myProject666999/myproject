package com.cashflow.dto.forecast;

import javax.validation.constraints.NotNull;
import java.util.List;

public class CashflowForecastRequest {

    @NotNull(message = "公司ID不能为空")
    private Long companyId;

    @NotNull(message = "预测天数不能为空")
    private Integer horizonDays;

    private ScenarioParams scenarioParams;

    private List<Long> accountIds;

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public Integer getHorizonDays() {
        return horizonDays;
    }

    public void setHorizonDays(Integer horizonDays) {
        this.horizonDays = horizonDays;
    }

    public ScenarioParams getScenarioParams() {
        return scenarioParams;
    }

    public void setScenarioParams(ScenarioParams scenarioParams) {
        this.scenarioParams = scenarioParams;
    }

    public List<Long> getAccountIds() {
        return accountIds;
    }

    public void setAccountIds(List<Long> accountIds) {
        this.accountIds = accountIds;
    }
}
