package com.cashflow.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.ExchangeRate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface CurrencyService extends IService<ExchangeRate> {

    List<ExchangeRate> listByDate(LocalDate rateDate);

    BigDecimal getRate(String fromCurrency, String toCurrency, LocalDate rateDate);

    ExchangeRate addExchangeRate(ExchangeRate exchangeRate);
}
