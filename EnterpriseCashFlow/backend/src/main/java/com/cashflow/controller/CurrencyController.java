package com.cashflow.controller;

import com.cashflow.common.Result;
import com.cashflow.entity.ExchangeRate;
import com.cashflow.service.CurrencyService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/currency")
@CrossOrigin
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/rates")
    public Result<Map<String, BigDecimal>> getAllRates() {
        return Result.success(currencyService.getAllRates());
    }

    @GetMapping("/rate")
    public Result<BigDecimal> getRate(@RequestParam String from, @RequestParam String to) {
        return Result.success(currencyService.getRate(from, to));
    }

    @GetMapping("/latest")
    public Result<List<ExchangeRate>> getLatestRates() {
        return Result.success(currencyService.getLatestRates());
    }

    @PostMapping("/rate")
    public Result<ExchangeRate> updateRate(@RequestBody ExchangeRate exchangeRate) {
        return Result.success(currencyService.updateRate(exchangeRate));
    }

    @PostMapping("/convert")
    public Result<Long> convert(@RequestParam Long amount,
                                @RequestParam String from,
                                @RequestParam String to) {
        return Result.success(currencyService.convert(amount, from, to));
    }
}
