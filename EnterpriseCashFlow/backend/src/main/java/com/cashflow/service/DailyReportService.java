package com.cashflow.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.DailyReport;

import java.time.LocalDate;

public interface DailyReportService extends IService<DailyReport> {

    DailyReport getByReportDate(Long companyId, LocalDate reportDate);

    DailyReport generateDailyReport(Long companyId, LocalDate reportDate);
}
