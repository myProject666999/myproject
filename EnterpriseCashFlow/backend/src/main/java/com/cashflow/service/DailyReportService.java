package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.DailyReport;

import java.time.LocalDate;

public interface DailyReportService extends IService<DailyReport> {

    DailyReport generateDailyReport(LocalDate reportDate);

    IPage<DailyReport> getReportList(int current, int size);

    DailyReport getReportByDate(LocalDate reportDate);
}
