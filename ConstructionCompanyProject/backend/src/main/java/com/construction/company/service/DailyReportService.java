package com.construction.company.service;

import com.construction.company.entity.DailyReport;

import java.util.List;

public interface DailyReportService {
    boolean save(DailyReport dailyReport);
    boolean updateById(DailyReport dailyReport);
    boolean removeById(Long id);
    DailyReport getById(Long id);
    List<DailyReport> list();
}
