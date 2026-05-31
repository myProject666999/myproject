package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.dto.forecast.DailyCashflow;
import com.cashflow.dto.forecast.ForecastResult;
import com.cashflow.entity.WarningRecord;
import com.cashflow.entity.WarningThreshold;
import com.cashflow.mapper.WarningRecordMapper;
import com.cashflow.mapper.WarningThresholdMapper;
import com.cashflow.service.CashflowForecastService;
import com.cashflow.service.WarningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class WarningServiceImpl extends ServiceImpl<WarningThresholdMapper, WarningThreshold> implements WarningService {

    @Autowired
    private WarningRecordMapper warningRecordMapper;

    @Autowired
    private CashflowForecastService cashflowForecastService;

    @Override
    public List<WarningThreshold> getThresholds() {
        return this.list(new LambdaQueryWrapper<WarningThreshold>()
                .eq(WarningThreshold::getIsEnabled, 1)
                .orderByAsc(WarningThreshold::getAbsoluteAmount));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public WarningThreshold updateThreshold(WarningThreshold threshold) {
        this.updateById(threshold);
        return threshold;
    }

    @Override
    public IPage<WarningRecord> getActiveWarnings(int current, int size) {
        return warningRecordMapper.selectPage(
                new Page<>(current, size),
                new LambdaQueryWrapper<WarningRecord>()
                        .eq(WarningRecord::getStatus, "ACTIVE")
                        .orderByDesc(WarningRecord::getTriggerDate)
        );
    }

    @Override
    public IPage<WarningRecord> getHistoryWarnings(int current, int size) {
        return warningRecordMapper.selectPage(
                new Page<>(current, size),
                new LambdaQueryWrapper<WarningRecord>()
                        .eq(WarningRecord::getStatus, "RESOLVED")
                        .orderByDesc(WarningRecord::getTriggerDate)
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resolveWarning(Long id) {
        WarningRecord record = warningRecordMapper.selectById(id);
        if (record != null) {
            record.setStatus("RESOLVED");
            record.setResolvedAt(java.time.LocalDateTime.now());
            warningRecordMapper.updateById(record);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkAndGenerateWarnings() {
        List<WarningThreshold> thresholds = getThresholds();
        if (thresholds.isEmpty()) {
            return;
        }

        ForecastResult forecast = cashflowForecastService.generateForecast(90);
        List<DailyCashflow> dailyCashflows = forecast.getDailyCashflows();

        for (WarningThreshold threshold : thresholds) {
            for (DailyCashflow dc : dailyCashflows) {
                if (dc.getCumulativeBalance() < threshold.getAbsoluteAmount()) {
                    WarningRecord existing = warningRecordMapper.selectOne(
                            new LambdaQueryWrapper<WarningRecord>()
                                    .eq(WarningRecord::getGapDate, LocalDate.parse(dc.getDate(), DateTimeFormatter.ISO_LOCAL_DATE))
                                    .eq(WarningRecord::getThresholdName, threshold.getName())
                                    .eq(WarningRecord::getStatus, "ACTIVE")
                    );

                    if (existing == null) {
                        WarningRecord record = new WarningRecord();
                        record.setTriggerDate(LocalDate.now());
                        record.setGapDate(LocalDate.parse(dc.getDate(), DateTimeFormatter.ISO_LOCAL_DATE));
                        record.setGapAmount(threshold.getAbsoluteAmount() - dc.getCumulativeBalance());
                        record.setLevel(threshold.getLevel());
                        record.setStatus("ACTIVE");
                        record.setThresholdName(threshold.getName());
                        warningRecordMapper.insert(record);
                    }
                }
            }
        }

        cleanupOldWarnings();
    }

    private void cleanupOldWarnings() {
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<WarningRecord> activeRecords = warningRecordMapper.selectList(
                new LambdaQueryWrapper<WarningRecord>()
                        .eq(WarningRecord::getStatus, "ACTIVE")
                        .lt(WarningRecord::getGapDate, thirtyDaysAgo)
        );

        for (WarningRecord record : activeRecords) {
            record.setStatus("RESOLVED");
            record.setResolvedAt(java.time.LocalDateTime.now());
            warningRecordMapper.updateById(record);
        }
    }
}
