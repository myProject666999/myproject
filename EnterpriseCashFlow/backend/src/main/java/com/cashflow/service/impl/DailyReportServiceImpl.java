package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.*;
import com.cashflow.mapper.*;
import com.cashflow.service.CurrencyService;
import com.cashflow.service.DailyReportService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DailyReportServiceImpl extends ServiceImpl<DailyReportMapper, DailyReport> implements DailyReportService {

    @Autowired
    private AccountMapper accountMapper;

    @Autowired
    private ReceivableMapper receivableMapper;

    @Autowired
    private PayableMapper payableMapper;

    @Autowired
    private AccountTransactionMapper transactionMapper;

    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public DailyReport generateDailyReport(LocalDate reportDate) {
        DailyReport existing = getReportByDate(reportDate);
        if (existing != null) {
            return existing;
        }

        DailyReport report = new DailyReport();
        report.setReportDate(reportDate);

        Map<String, Object> content = new HashMap<>();

        long openingBalance = 0L;
        long totalIncome = 0L;
        long totalExpense = 0L;

        List<Account> accounts = accountMapper.selectList(null);
        for (Account account : accounts) {
            openingBalance += currencyService.convertToCNY(account.getBalance(), account.getCurrency());
        }

        List<AccountTransaction> transactions = transactionMapper.selectList(
                new LambdaQueryWrapper<AccountTransaction>()
                        .eq(AccountTransaction::getTransactionDate, reportDate)
        );

        for (AccountTransaction t : transactions) {
            long amountCNY = currencyService.convertToCNY(t.getAmount(), t.getCurrency());
            if ("IN".equals(t.getType())) {
                totalIncome += amountCNY;
            } else {
                totalExpense += amountCNY;
            }
        }

        List<Receivable> receivables = receivableMapper.selectList(
                new LambdaQueryWrapper<Receivable>()
                        .eq(Receivable::getDueDate, reportDate)
                        .in(Receivable::getStatus, "PENDING", "OVERDUE", "PARTIAL")
        );
        long todayReceivable = 0L;
        for (Receivable r : receivables) {
            todayReceivable += currencyService.convertToCNY(r.getAmount() - r.getReceivedAmount(), r.getCurrency());
        }

        List<Payable> payables = payableMapper.selectList(
                new LambdaQueryWrapper<Payable>()
                        .eq(Payable::getDueDate, reportDate)
                        .in(Payable::getStatus, "PENDING", "OVERDUE", "PARTIAL")
        );
        long todayPayable = 0L;
        for (Payable p : payables) {
            todayPayable += currencyService.convertToCNY(p.getAmount() - p.getPaidAmount(), p.getCurrency());
        }

        report.setOpeningBalance(openingBalance);
        report.setTotalIncome(totalIncome);
        report.setTotalExpense(totalExpense);
        report.setClosingBalance(openingBalance + totalIncome - totalExpense);

        content.put("todayReceivable", todayReceivable);
        content.put("todayPayable", todayPayable);
        content.put("accountCount", accounts.size());
        content.put("transactionCount", transactions.size());

        try {
            report.setContentJson(objectMapper.writeValueAsString(content));
        } catch (JsonProcessingException e) {
            report.setContentJson("{}");
        }

        this.save(report);
        return report;
    }

    @Override
    public IPage<DailyReport> getReportList(int current, int size) {
        return this.page(
                new Page<>(current, size),
                new LambdaQueryWrapper<DailyReport>()
                        .orderByDesc(DailyReport::getReportDate)
        );
    }

    @Override
    public DailyReport getReportByDate(LocalDate reportDate) {
        return this.getOne(
                new LambdaQueryWrapper<DailyReport>()
                        .eq(DailyReport::getReportDate, reportDate)
        );
    }
}
