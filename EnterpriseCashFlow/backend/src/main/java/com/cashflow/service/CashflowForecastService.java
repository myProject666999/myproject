package com.cashflow.service;

import com.cashflow.dto.forecast.DailyCashflow;
import com.cashflow.dto.forecast.ForecastResult;
import com.cashflow.dto.forecast.ScenarioParams;

import java.time.LocalDate;
import java.util.List;

public interface CashflowForecastService {

    ForecastResult generateForecast(int horizonDays);

    ForecastResult generateScenarioForecast(int horizonDays, ScenarioParams scenarioParams);

    List<DailyCashflow> getDailyCashflows(LocalDate startDate, LocalDate endDate);
}
