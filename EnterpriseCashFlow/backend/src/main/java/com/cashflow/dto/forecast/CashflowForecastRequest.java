package com.cashflow.dto.forecast;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class CashflowForecastRequest {

    @NotNull(message = "公司ID不能为空")
    private Long companyId;

    @NotNull(message = "预测天数不能为空")
    private Integer horizonDays;

    private ScenarioParams scenarioParams;

    private List<Long> accountIds;
}
