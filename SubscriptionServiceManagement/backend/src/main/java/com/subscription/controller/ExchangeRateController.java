package com.subscription.controller;

import com.subscription.entity.ExchangeRate;
import com.subscription.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping
    public ResponseEntity<List<ExchangeRate>> getAllRates() {
        return ResponseEntity.ok(exchangeRateService.getAllRates());
    }

    @GetMapping("/{currencyFrom}/{currencyTo}")
    public ResponseEntity<ExchangeRate> getRate(@PathVariable String currencyFrom, @PathVariable String currencyTo) {
        Optional<ExchangeRate> rate = exchangeRateService.getRate(currencyFrom, currencyTo);
        return rate.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ExchangeRate> createRate(@RequestBody ExchangeRate rate) {
        return ResponseEntity.ok(exchangeRateService.saveRate(rate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExchangeRate> updateRate(@PathVariable Long id, @RequestBody ExchangeRate rate) {
        rate.setId(id);
        return ResponseEntity.ok(exchangeRateService.saveRate(rate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRate(@PathVariable Long id) {
        exchangeRateService.deleteRate(id);
        return ResponseEntity.noContent().build();
    }
}
