package com.cashflow.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.ExchangeRate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface CurrencyService extends IService<ExchangeRate> {

    BigDecimal getRate(String fromCurrency, String toCurrency);

    BigDecimal getRateByDate(String fromCurrency, String toCurrency, LocalDate date);

    List<ExchangeRate> getLatestRates();

    ExchangeRate updateRate(ExchangeRate exchangeRate);

    Long convertToCNY(Long amount, String currency);

    Long convert(Long amount, String fromCurrency, String toCurrency);

    Map<String, BigDecimal> getAllRates();
}
