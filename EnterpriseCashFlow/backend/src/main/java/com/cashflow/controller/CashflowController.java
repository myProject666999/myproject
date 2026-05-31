package com.cashflow.controller;

import com.cashflow.common.Result;
import com.cashflow.dto.forecast.ForecastResult;
import com.cashflow.dto.forecast.ScenarioParams;
import com.cashflow.service.CashflowForecastService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cashflow")
@CrossOrigin
public class CashflowController {

    private final CashflowForecastService cashflowForecastService;

    public CashflowController(CashflowForecastService cashflowForecastService) {
        this.cashflowForecastService = cashflowForecastService;
    }

    @GetMapping("/forecast")
    public Result<ForecastResult> forecast(@RequestParam(defaultValue = "30") int horizonDays) {
        return Result.success(cashflowForecastService.generateForecast(horizonDays));
    }

    @PostMapping("/scenario")
    public Result<ForecastResult> scenarioForecast(@RequestParam(defaultValue = "30") int horizonDays,
                                                   @RequestBody(required = false) ScenarioParams scenarioParams) {
        return Result.success(cashflowForecastService.generateScenarioForecast(horizonDays, scenarioParams));
    }
}
