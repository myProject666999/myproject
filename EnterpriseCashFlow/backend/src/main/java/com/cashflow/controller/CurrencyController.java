package com.cashflow.controller;

import com.cashflow.common.Result;
import com.cashflow.entity.ExchangeRate;
import com.cashflow.service.CurrencyService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/currency")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/rates")
    public Result<List<ExchangeRate>> listByDate(@RequestParam String date) {
        LocalDate rateDate = LocalDate.parse(date);
        return Result.success(currencyService.listByDate(rateDate));
    }

    @GetMapping("/rate")
    public Result<BigDecimal> getRate(@RequestParam String from,
                                      @RequestParam String to,
                                      @RequestParam String date) {
        LocalDate rateDate = LocalDate.parse(date);
        return Result.success(currencyService.getRate(from, to, rateDate));
    }

    @PostMapping
    public Result<ExchangeRate> add(@RequestBody ExchangeRate exchangeRate) {
        return Result.success(currencyService.addExchangeRate(exchangeRate));
    }
}
