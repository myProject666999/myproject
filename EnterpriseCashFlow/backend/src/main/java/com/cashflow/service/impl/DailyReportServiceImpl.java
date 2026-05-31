package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.AccountTransaction;
import com.cashflow.entity.DailyReport;
import com.cashflow.entity.WarningRecord;
import com.cashflow.mapper.DailyReportMapper;
import com.cashflow.service.DailyReportService;
import com.cashflow.service.WarningService;
import com.cashflow.service.AccountService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DailyReportServiceImpl extends ServiceImpl<DailyReportMapper, DailyReport> implements DailyReportService {

    private final AccountService accountService;
    private final WarningService warningService;

    public DailyReportServiceImpl(AccountService accountService, WarningService warningService) {
        this.accountService = accountService;
        this.warningService = warningService;
    }

    @Override
    public DailyReport getByReportDate(Long companyId, LocalDate reportDate) {
        LambdaQueryWrapper<DailyReport> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DailyReport::getCompanyId, companyId)
                .eq(DailyReport::getReportDate, reportDate);
        return this.getOne(wrapper, false);
    }

    @Override
    public DailyReport generateDailyReport(Long companyId, LocalDate reportDate) {
        DailyReport existing = getByReportDate(companyId, reportDate);
        if (existing != null) {
            this.removeById(existing.getId());
        }

        Long totalBalance = accountService.getTotalBalance(companyId);

        LambdaQueryWrapper<AccountTransaction> incomeWrapper = new LambdaQueryWrapper<>();
        incomeWrapper.eq(AccountTransaction::getCompanyId, companyId)
                .eq(AccountTransaction::getTransactionType, "INCOME")
                .eq(AccountTransaction::getTransactionDate, reportDate);

        LambdaQueryWrapper<AccountTransaction> expenseWrapper = new LambdaQueryWrapper<>();
        expenseWrapper.eq(AccountTransaction::getCompanyId, companyId)
                .eq(AccountTransaction::getTransactionType, "EXPENSE")
                .eq(AccountTransaction::getTransactionDate, reportDate);

        List<WarningRecord> warnings = warningService.listByDateRange(companyId, reportDate, reportDate);

        DailyReport report = new DailyReport();
        report.setCompanyId(companyId);
        report.setReportDate(reportDate);
        report.setTotalBalance(totalBalance);
        report.setWarningCount(warnings.size());
        report.setSummary("生成于 " + reportDate);

        this.save(report);
        return report;
    }
}
