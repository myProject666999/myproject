package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.dto.forecast.CashflowForecastRequest;
import com.cashflow.dto.forecast.DailyCashflow;
import com.cashflow.dto.forecast.ForecastResult;
import com.cashflow.dto.forecast.ScenarioParams;
import com.cashflow.entity.WarningRecord;
import com.cashflow.entity.WarningThreshold;
import com.cashflow.mapper.WarningRecordMapper;
import com.cashflow.mapper.WarningThresholdMapper;
import com.cashflow.service.CashflowForecastService;
import com.cashflow.service.WarningService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class WarningServiceImpl extends ServiceImpl<WarningRecordMapper, WarningRecord> implements WarningService {

    private final WarningThresholdMapper warningThresholdMapper;
    private final CashflowForecastService forecastService;

    public WarningServiceImpl(WarningThresholdMapper warningThresholdMapper,
                              CashflowForecastService forecastService) {
        this.warningThresholdMapper = warningThresholdMapper;
        this.forecastService = forecastService;
    }

    @Override
    public IPage<WarningRecord> pageList(int current, int size, String warningLevel, Integer status) {
        Page<WarningRecord> page = new Page<>(current, size);
        LambdaQueryWrapper<WarningRecord> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(warningLevel)) {
            wrapper.eq(WarningRecord::getWarningLevel, warningLevel);
        }
        if (status != null) {
            wrapper.eq(WarningRecord::getStatus, status);
        }
        wrapper.orderByDesc(WarningRecord::getCreatedAt);
        return this.page(page, wrapper);
    }

    @Override
    public List<WarningRecord> listByDateRange(Long companyId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<WarningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WarningRecord::getCompanyId, companyId)
                .ge(WarningRecord::getWarningDate, startDate)
                .le(WarningRecord::getWarningDate, endDate)
                .orderByDesc(WarningRecord::getCreatedAt);
        return this.list(wrapper);
    }

    @Override
    public void checkAndGenerateWarnings(Long companyId) {
        LambdaQueryWrapper<WarningThreshold> thresholdWrapper = new LambdaQueryWrapper<>();
        thresholdWrapper.eq(WarningThreshold::getCompanyId, companyId)
                .eq(WarningThreshold::getStatus, 1);
        List<WarningThreshold> thresholds = warningThresholdMapper.selectList(thresholdWrapper);

        if (thresholds.isEmpty()) {
            return;
        }

        WarningThreshold threshold = thresholds.get(0);
        int horizonDays = threshold.getHorizonDays() != null ? threshold.getHorizonDays() : 30;

        CashflowForecastRequest request = new CashflowForecastRequest();
        request.setCompanyId(companyId);
        request.setHorizonDays(horizonDays);

        ForecastResult result = forecastService.forecast(request);

        for (DailyCashflow dc : result.getDailyCashflows()) {
            LocalDate warningDate = LocalDate.parse(dc.getDate(), DateTimeFormatter.ISO_LOCAL_DATE);
            long predictedBalance = dc.getCumulativeBalance();

            String warningLevel = determineWarningLevel(predictedBalance, threshold);
            if (warningLevel != null) {
                WarningRecord existing = findExistingWarning(companyId, warningDate, warningLevel);
                if (existing == null) {
                    WarningRecord record = new WarningRecord();
                    record.setCompanyId(companyId);
                    record.setWarningLevel(warningLevel);
                    record.setWarningDate(warningDate);
                    record.setPredictedBalance(predictedBalance);
                    record.setThresholdValue(getThresholdValue(warningLevel, threshold));
                    record.setCurrency(threshold.getCurrency());
                    record.setDescription(buildDescription(warningLevel, warningDate, predictedBalance));
                    record.setStatus(0);
                    this.save(record);
                }
            }
        }
    }

    @Override
    public void handleWarning(Long warningId, Integer status) {
        WarningRecord record = this.getById(warningId);
        if (record != null) {
            record.setStatus(status);
            this.updateById(record);
        }
    }

    private String determineWarningLevel(Long predictedBalance, WarningThreshold threshold) {
        if (threshold.getRedThreshold() != null && predictedBalance < threshold.getRedThreshold()) {
            return "RED";
        }
        if (threshold.getOrangeThreshold() != null && predictedBalance < threshold.getOrangeThreshold()) {
            return "ORANGE";
        }
        if (threshold.getYellowThreshold() != null && predictedBalance < threshold.getYellowThreshold()) {
            return "YELLOW";
        }
        return null;
    }

    private Long getThresholdValue(String warningLevel, WarningThreshold threshold) {
        switch (warningLevel) {
            case "RED":
                return threshold.getRedThreshold();
            case "ORANGE":
                return threshold.getOrangeThreshold();
            case "YELLOW":
                return threshold.getYellowThreshold();
            default:
                return 0L;
        }
    }

    private WarningRecord findExistingWarning(Long companyId, LocalDate warningDate, String warningLevel) {
        LambdaQueryWrapper<WarningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WarningRecord::getCompanyId, companyId)
                .eq(WarningRecord::getWarningDate, warningDate)
                .eq(WarningRecord::getWarningLevel, warningLevel)
                .eq(WarningRecord::getStatus, 0)
                .last("LIMIT 1");
        return this.getOne(wrapper, false);
    }

    private String buildDescription(String warningLevel, LocalDate warningDate, Long predictedBalance) {
        return warningLevel + "预警: " + warningDate + " 预测资金余额 " + predictedBalance + " 低于阈值";
    }
}
