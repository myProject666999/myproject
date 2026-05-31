package com.cashflow.controller;

import com.cashflow.common.Result;
import com.cashflow.dto.forecast.CashflowForecastRequest;
import com.cashflow.dto.forecast.ForecastResult;
import com.cashflow.service.CashflowForecastService;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/cashflow")
public class CashflowController {

    private final CashflowForecastService forecastService;

    public CashflowController(CashflowForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @PostMapping("/forecast")
    public Result<ForecastResult> forecast(@Valid @RequestBody CashflowForecastRequest request) {
        return Result.success(forecastService.forecast(request));
    }
}
