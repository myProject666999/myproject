package com.subscription.service;

import com.subscription.entity.ExchangeRate;
import com.subscription.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExchangeRateService {

    private final ExchangeRateRepository exchangeRateRepository;

    public List<ExchangeRate> getAllRates() {
        return exchangeRateRepository.findAll();
    }

    public ExchangeRate saveRate(ExchangeRate rate) {
        return exchangeRateRepository.save(rate);
    }

    public BigDecimal convertToCNY(BigDecimal amount, String currencyFrom) {
        if ("CNY".equals(currencyFrom)) {
            return amount;
        }
        Optional<ExchangeRate> rateOpt = exchangeRateRepository.findByCurrencyFromAndCurrencyTo(currencyFrom, "CNY");
        if (rateOpt.isPresent()) {
            return amount.multiply(rateOpt.get().getRate());
        }
        return amount;
    }

    public Optional<ExchangeRate> getRate(String currencyFrom, String currencyTo) {
        return exchangeRateRepository.findByCurrencyFromAndCurrencyTo(currencyFrom, currencyTo);
    }

    public void deleteRate(Long id) {
        exchangeRateRepository.deleteById(id);
    }
}
