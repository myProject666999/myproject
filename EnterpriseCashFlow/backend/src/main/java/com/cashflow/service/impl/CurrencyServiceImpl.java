package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.ExchangeRate;
import com.cashflow.mapper.ExchangeRateMapper;
import com.cashflow.service.CurrencyService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CurrencyServiceImpl extends ServiceImpl<ExchangeRateMapper, ExchangeRate> implements CurrencyService {

    @Override
    public BigDecimal getRate(String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return BigDecimal.ONE;
        }

        LambdaQueryWrapper<ExchangeRate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExchangeRate::getFromCurrency, fromCurrency)
                .eq(ExchangeRate::getToCurrency, toCurrency)
                .orderByDesc(ExchangeRate::getEffectiveDate)
                .last("LIMIT 1");

        ExchangeRate rate = this.getOne(wrapper);
        if (rate != null) {
            return rate.getRate();
        }

        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExchangeRate::getFromCurrency, toCurrency)
                .eq(ExchangeRate::getToCurrency, fromCurrency)
                .orderByDesc(ExchangeRate::getEffectiveDate)
                .last("LIMIT 1");

        rate = this.getOne(wrapper);
        if (rate != null) {
            return BigDecimal.ONE.divide(rate.getRate(), 8, RoundingMode.HALF_UP);
        }

        return BigDecimal.ONE;
    }

    @Override
    public BigDecimal getRateByDate(String fromCurrency, String toCurrency, LocalDate date) {
        if (fromCurrency.equals(toCurrency)) {
            return BigDecimal.ONE;
        }

        LambdaQueryWrapper<ExchangeRate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ExchangeRate::getFromCurrency, fromCurrency)
                .eq(ExchangeRate::getToCurrency, toCurrency)
                .le(ExchangeRate::getEffectiveDate, date)
                .orderByDesc(ExchangeRate::getEffectiveDate)
                .last("LIMIT 1");

        ExchangeRate rate = this.getOne(wrapper);
        return rate != null ? rate.getRate() : getRate(fromCurrency, toCurrency);
    }

    @Override
    public List<ExchangeRate> getLatestRates() {
        return this.list(new LambdaQueryWrapper<ExchangeRate>()
                .orderByDesc(ExchangeRate::getEffectiveDate));
    }

    @Override
    public ExchangeRate updateRate(ExchangeRate exchangeRate) {
        this.saveOrUpdate(exchangeRate);
        return exchangeRate;
    }

    @Override
    public Long convertToCNY(Long amount, String currency) {
        if ("CNY".equals(currency) || amount == null) {
            return amount;
        }
        BigDecimal rate = getRate(currency, "CNY");
        return BigDecimal.valueOf(amount).multiply(rate).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    @Override
    public Long convert(Long amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency) || amount == null) {
            return amount;
        }
        BigDecimal rate = getRate(fromCurrency, toCurrency);
        return BigDecimal.valueOf(amount).multiply(rate).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    @Override
    public Map<String, BigDecimal> getAllRates() {
        Map<String, BigDecimal> rates = new HashMap<>();
        List<ExchangeRate> latestRates = getLatestRates();
        for (ExchangeRate rate : latestRates) {
            String key = rate.getFromCurrency() + "-" + rate.getToCurrency();
            if (!rates.containsKey(key)) {
                rates.put(key, rate.getRate());
            }
        }
        return rates;
    }
}
