package com.cashflow.service.impl;

import com.cashflow.dto.forecast.DailyCashflow;
import com.cashflow.dto.forecast.ForecastResult;
import com.cashflow.dto.forecast.ScenarioParams;
import com.cashflow.entity.Account;
import com.cashflow.entity.Payable;
import com.cashflow.entity.Receivable;
import com.cashflow.mapper.AccountMapper;
import com.cashflow.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CashflowForecastServiceImpl implements CashflowForecastService {

    @Autowired
    private AccountService accountService;

    @Autowired
    private ReceivableService receivableService;

    @Autowired
    private PayableService payableService;

    @Autowired
    private CurrencyService currencyService;

    @Override
    public ForecastResult generateForecast(int horizonDays) {
        return generateScenarioForecast(horizonDays, null);
    }

    @Override
    public ForecastResult generateScenarioForecast(int horizonDays, ScenarioParams scenarioParams) {
        ForecastResult result = new ForecastResult();
        List<DailyCashflow> dailyCashflows = new ArrayList<>();

        Map<String, Object> summary = accountService.getSummary();
        Long currentBalance = (Long) summary.get("totalBalance");
        result.setCurrentBalance(currentBalance);

        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(horizonDays);

        List<Receivable> receivables = receivableService.listByDueDateRange(today, endDate);
        List<Payable> payables = payableService.listByDueDateRange(today, endDate);

        Map<String, DailyCashflow> cashflowMap = new LinkedHashMap<>();

        for (int i = 0; i < horizonDays; i++) {
            LocalDate date = today.plusDays(i);
            String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
            cashflowMap.put(dateStr, new DailyCashflow());
            cashflowMap.get(dateStr).setDate(dateStr);
        }

        BigDecimal delayRate = scenarioParams != null && scenarioParams.getDelayReceivableRate() != null
                ? scenarioParams.getDelayReceivableRate() : BigDecimal.ZERO;
        BigDecimal earlyRate = scenarioParams != null && scenarioParams.getEarlyPayableRate() != null
                ? scenarioParams.getEarlyPayableRate() : BigDecimal.ZERO;

        for (Receivable r : receivables) {
            LocalDate dueDate = r.getDueDate();
            if (delayRate.compareTo(BigDecimal.ZERO) > 0) {
                int delayDays = (int) Math.round(horizonDays * delayRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP).doubleValue());
                dueDate = dueDate.plusDays(delayDays);
            }

            if (!dueDate.isAfter(endDate)) {
                String dateStr = dueDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
                DailyCashflow dc = cashflowMap.get(dateStr);
                if (dc == null) {
                    dc = new DailyCashflow();
                    dc.setDate(dateStr);
                    cashflowMap.put(dateStr, dc);
                }
                long amountCNY = currencyService.convertToCNY(r.getAmount() - r.getReceivedAmount(), r.getCurrency());
                dc.setInflow(dc.getInflow() + amountCNY);
            }
        }

        for (Payable p : payables) {
            LocalDate dueDate = p.getDueDate();
            if (earlyRate.compareTo(BigDecimal.ZERO) > 0) {
                int earlyDays = (int) Math.round(horizonDays * earlyRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP).doubleValue());
                dueDate = dueDate.minusDays(earlyDays);
            }

            if (!dueDate.isAfter(endDate)) {
                String dateStr = dueDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
                DailyCashflow dc = cashflowMap.get(dateStr);
                if (dc == null) {
                    dc = new DailyCashflow();
                    dc.setDate(dateStr);
                    cashflowMap.put(dateStr, dc);
                }
                long amountCNY = currencyService.convertToCNY(p.getAmount() - p.getPaidAmount(), p.getCurrency());
                dc.setOutflow(dc.getOutflow() + amountCNY);
            }
        }

        if (scenarioParams != null) {
            if (scenarioParams.getExtraInflows() != null) {
                for (ScenarioParams.ExtraCashflow ec : scenarioParams.getExtraInflows()) {
                    DailyCashflow dc = cashflowMap.get(ec.getDate());
                    if (dc != null) {
                        dc.setInflow(dc.getInflow() + ec.getAmount());
                    }
                }
            }
            if (scenarioParams.getExtraOutflows() != null) {
                for (ScenarioParams.ExtraCashflow ec : scenarioParams.getExtraOutflows()) {
                    DailyCashflow dc = cashflowMap.get(ec.getDate());
                    if (dc != null) {
                        dc.setOutflow(dc.getOutflow() + ec.getAmount());
                    }
                }
            }
        }

        long cumulativeBalance = currentBalance;
        for (DailyCashflow dc : cashflowMap.values()) {
            dc.setNetFlow(dc.getInflow() - dc.getOutflow());
            cumulativeBalance += dc.getNetFlow();
            dc.setCumulativeBalance(cumulativeBalance);
            dailyCashflows.add(dc);
        }

        result.setDailyCashflows(dailyCashflows);
        result.setWarningCount(countWarnings(dailyCashflows));

        return result;
    }

    private int countWarnings(List<DailyCashflow> dailyCashflows) {
        int count = 0;
        for (DailyCashflow dc : dailyCashflows) {
            if (dc.getCumulativeBalance() < 0) {
                count++;
            }
        }
        return count;
    }

    @Override
    public List<DailyCashflow> getDailyCashflows(LocalDate startDate, LocalDate endDate) {
        List<DailyCashflow> result = new ArrayList<>();
        LocalDate date = startDate;
        while (!date.isAfter(endDate)) {
            DailyCashflow dc = new DailyCashflow();
            dc.setDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE));
            result.add(dc);
            date = date.plusDays(1);
        }
        return result;
    }
}
