package com.port.container.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.port.container.entity.StatisticsRecord;
import com.port.container.vo.*;

import java.time.LocalDate;
import java.util.List;

public interface StatisticsService extends IService<StatisticsRecord> {

    DashboardDataVO getDashboardData();

    List<RehandleRateVO> getRehandleRateAnalysis(LocalDate startDate, LocalDate endDate);

    List<ThroughputVO> getThroughputStatistics(LocalDate startDate, LocalDate endDate, String type);

    List<CraneUtilizationVO> getCraneUtilization(LocalDate startDate, LocalDate endDate);

    List<SlotUtilizationTrendVO> getSlotUtilizationTrend(LocalDate startDate, LocalDate endDate);

    boolean generateDailyStatistics(LocalDate statDate);
}
