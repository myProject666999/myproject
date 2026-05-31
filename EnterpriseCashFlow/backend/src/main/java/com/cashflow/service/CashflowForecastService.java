package com.cashflow.service;

import com.cashflow.dto.forecast.CashflowForecastRequest;
import com.cashflow.dto.forecast.ForecastResult;

public interface CashflowForecastService {

    ForecastResult forecast(CashflowForecastRequest request);
}
