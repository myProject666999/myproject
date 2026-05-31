package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.ExchangeRate;
import com.cashflow.mapper.ExchangeRateMapper;
import com.cashflow.service.CurrencyService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CurrencyServiceImpl extends ServiceImpl<ExchangeRateMapper, ExchangeRate> implements CurrencyService {

    @Override
    public List<ExchangeRate> listByDate(LocalDate rateDate) {
        LambdaQueryWrapper<ExchangeRate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExchangeRate::getRateDate, rateDate)
                .orderByAsc(ExchangeRate::getFromCurrency);
        return this.list(wrapper);
    }

    @Override
    public BigDecimal getRate(String fromCurrency, String toCurrency, LocalDate rateDate) {
        if (fromCurrency.equals(toCurrency)) {
            return BigDecimal.ONE;
        }
        LambdaQueryWrapper<ExchangeRate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExchangeRate::getFromCurrency, fromCurrency)
                .eq(ExchangeRate::getToCurrency, toCurrency)
                .eq(ExchangeRate::getRateDate, rateDate)
                .last("LIMIT 1");
        ExchangeRate rate = this.getOne(wrapper, false);
        if (rate != null) {
            return rate.getRate();
        }

        LambdaQueryWrapper<ExchangeRate> reverseWrapper = new LambdaQueryWrapper<>();
        reverseWrapper.eq(ExchangeRate::getFromCurrency, toCurrency)
                .eq(ExchangeRate::getToCurrency, fromCurrency)
                .eq(ExchangeRate::getRateDate, rateDate)
                .last("LIMIT 1");
        ExchangeRate reverseRate = this.getOne(reverseWrapper, false);
        if (reverseRate != null && reverseRate.getRate().compareTo(BigDecimal.ZERO) != 0) {
            return BigDecimal.ONE.divide(reverseRate.getRate(), 6, BigDecimal.ROUND_HALF_UP);
        }

        LambdaQueryWrapper<ExchangeRate> latestWrapper = new LambdaQueryWrapper<>();
        latestWrapper.eq(ExchangeRate::getFromCurrency, fromCurrency)
                .eq(ExchangeRate::getToCurrency, toCurrency)
                .le(ExchangeRate::getRateDate, rateDate)
                .orderByDesc(ExchangeRate::getRateDate)
                .last("LIMIT 1");
        ExchangeRate latestRate = this.getOne(latestWrapper, false);
        return latestRate != null ? latestRate.getRate() : null;
    }

    @Override
    public ExchangeRate addExchangeRate(ExchangeRate exchangeRate) {
        this.save(exchangeRate);
        return exchangeRate;
    }
}
