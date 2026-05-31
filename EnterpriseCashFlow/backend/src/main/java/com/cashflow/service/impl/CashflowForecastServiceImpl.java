package com.cashflow.service.impl;

import com.cashflow.dto.forecast.CashflowForecastRequest;
import com.cashflow.dto.forecast.DailyCashflow;
import com.cashflow.dto.forecast.ForecastResult;
import com.cashflow.dto.forecast.ScenarioParams;
import com.cashflow.entity.Account;
import com.cashflow.entity.Payable;
import com.cashflow.entity.Receivable;
import com.cashflow.service.AccountService;
import com.cashflow.service.CashflowForecastService;
import com.cashflow.service.PayableService;
import com.cashflow.service.ReceivableService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class CashflowForecastServiceImpl implements CashflowForecastService {

    private final AccountService accountService;
    private final ReceivableService receivableService;
    private final PayableService payableService;
    private final RedisTemplate<String, Object> redisTemplate;

    public CashflowForecastServiceImpl(AccountService accountService,
                                       ReceivableService receivableService,
                                       PayableService payableService,
                                       RedisTemplate<String, Object> redisTemplate) {
        this.accountService = accountService;
        this.receivableService = receivableService;
        this.payableService = payableService;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public ForecastResult forecast(CashflowForecastRequest request) {
        String cacheKey = "forecast:" + request.getCompanyId() + ":" + request.getHorizonDays();
        if (request.getScenarioParams() != null) {
            cacheKey += ":" + request.getScenarioParams().hashCode();
        }

        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return (ForecastResult) cached;
        }

        Long companyId = request.getCompanyId();
        int horizonDays = request.getHorizonDays();
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(horizonDays);

        List<Account> accounts;
        if (request.getAccountIds() != null && !request.getAccountIds().isEmpty()) {
            accounts = accountService.listByIds(request.getAccountIds());
        } else {
            accounts = accountService.listByCompanyId(companyId);
        }

        long currentBalance = accounts.stream().mapToLong(Account::getBalance).sum();

        List<Receivable> receivables = receivableService.listByDueDateRange(companyId, today, endDate);
        List<Payable> payables = payableService.listByDueDateRange(companyId, today, endDate);

        ScenarioParams params = request.getScenarioParams();
        if (params == null) {
            params = new ScenarioParams();
        }

        Map<LocalDate, Long> inflowMap = new LinkedHashMap<>();
        Map<LocalDate, Long> outflowMap = new LinkedHashMap<>();

        for (Receivable r : receivables) {
            LocalDate dueDate = r.getDueDate();
            long amount = r.getAmount();

            if (params.getDelayReceivableRate().compareTo(BigDecimal.ZERO) > 0) {
                long delayed = amount * params.getDelayReceivableRate()
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP).longValue();
                inflowMap.merge(dueDate, amount - delayed, Long::sum);
                inflowMap.merge(dueDate.plusDays(7), delayed, Long::sum);
            } else {
                inflowMap.merge(dueDate, amount, Long::sum);
            }
        }

        for (Payable p : payables) {
            LocalDate dueDate = p.getDueDate();
            long amount = p.getAmount();

            if (params.getEarlyPayableRate().compareTo(BigDecimal.ZERO) > 0) {
                long early = amount * params.getEarlyPayableRate()
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP).longValue();
                outflowMap.merge(dueDate.minusDays(3), early, Long::sum);
                outflowMap.merge(dueDate, amount - early, Long::sum);
            } else {
                outflowMap.merge(dueDate, amount, Long::sum);
            }
        }

        if (params.getExtraInflows() != null) {
            for (ScenarioParams.ExtraCashflow ec : params.getExtraInflows()) {
                LocalDate date = LocalDate.parse(ec.getDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                inflowMap.merge(date, ec.getAmount(), Long::sum);
            }
        }

        if (params.getExtraOutflows() != null) {
            for (ScenarioParams.ExtraCashflow ec : params.getExtraOutflows()) {
                LocalDate date = LocalDate.parse(ec.getDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                outflowMap.merge(date, ec.getAmount(), Long::sum);
            }
        }

        List<DailyCashflow> dailyCashflows = new ArrayList<>();
        long cumulativeBalance = currentBalance;
        int warningCount = 0;

        for (int i = 0; i <= horizonDays; i++) {
            LocalDate date = today.plusDays(i);
            DailyCashflow dc = new DailyCashflow();
            dc.setDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE));

            long inflow = inflowMap.getOrDefault(date, 0L);
            long outflow = outflowMap.getOrDefault(date, 0L);
            long netFlow = inflow - outflow;

            if (i == 0) {
                dc.setInflow(inflow);
                dc.setOutflow(outflow);
                dc.setNetFlow(netFlow);
                dc.setCumulativeBalance(cumulativeBalance);
            } else {
                cumulativeBalance += netFlow;
                dc.setInflow(inflow);
                dc.setOutflow(outflow);
                dc.setNetFlow(netFlow);
                dc.setCumulativeBalance(cumulativeBalance);
            }

            if (cumulativeBalance < 0) {
                warningCount++;
            }

            dailyCashflows.add(dc);
        }

        ForecastResult result = new ForecastResult();
        result.setCurrentBalance(currentBalance);
        result.setDailyCashflows(dailyCashflows);
        result.setWarningCount(warningCount);

        redisTemplate.opsForValue().set(cacheKey, result, 30, TimeUnit.MINUTES);
        return result;
    }
}
