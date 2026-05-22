package com.sleeprecord.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.sleeprecord.dto.SleepRecordDTO;
import com.sleeprecord.entity.SleepRecord;
import com.sleeprecord.mapper.SleepRecordMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class SleepRecordService extends ServiceImpl<SleepRecordMapper, SleepRecord> {

    public SleepRecord createRecord(SleepRecordDTO dto) {
        SleepRecord record = new SleepRecord();
        record.setSleepTime(dto.getSleepTime());
        record.setWakeTime(dto.getWakeTime());
        record.setQualityScore(dto.getQualityScore());
        record.setDeepSleep(dto.getDeepSleep());
        record.setLightSleep(dto.getLightSleep());
        record.setRemark(dto.getRemark());

        LocalDate sleepDate = calculateSleepDate(dto.getSleepTime(), dto.getWakeTime());
        record.setSleepDate(sleepDate);

        save(record);
        return record;
    }

    public SleepRecord updateRecord(Long id, SleepRecordDTO dto) {
        SleepRecord record = getById(id);
        if (record == null) {
            throw new RuntimeException("记录不存在");
        }

        record.setSleepTime(dto.getSleepTime());
        record.setWakeTime(dto.getWakeTime());
        record.setQualityScore(dto.getQualityScore());
        record.setDeepSleep(dto.getDeepSleep());
        record.setLightSleep(dto.getLightSleep());
        record.setRemark(dto.getRemark());

        LocalDate sleepDate = calculateSleepDate(dto.getSleepTime(), dto.getWakeTime());
        record.setSleepDate(sleepDate);

        updateById(record);
        return record;
    }

    private LocalDate calculateSleepDate(LocalDateTime sleepTime, LocalDateTime wakeTime) {
        if (sleepTime.toLocalTime().isAfter(LocalTime.of(12, 0))) {
            return sleepTime.toLocalDate();
        } else {
            return sleepTime.toLocalDate().minusDays(1);
        }
    }

    public Map<String, Object> getReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();

        Map<String, Object> summary = baseMapper.getSummary(startDate, endDate);
        result.put("summary", summary);

        List<Map<String, Object>> dailyRecords = baseMapper.getDailyRecords(startDate, endDate);
        result.put("dailyRecords", dailyRecords);

        List<Map<String, Object>> monthlyReport = baseMapper.getMonthlyReport(startDate, endDate);
        result.put("monthlyReport", monthlyReport);

        Map<String, Object> regularityStats = baseMapper.getRegularityStats(startDate, endDate);
        int regularityScore = calculateRegularityScore(regularityStats);
        result.put("regularityScore", regularityScore);
        result.put("regularityStats", regularityStats);

        return result;
    }

    private int calculateRegularityScore(Map<String, Object> stats) {
        if (stats == null || stats.get("total_count") == null) {
            return 0;
        }

        long totalCount = ((Number) stats.get("total_count")).longValue();
        if (totalCount == 0) {
            return 0;
        }

        int score = 100;

        Number earlySleepCountObj = (Number) stats.get("early_sleep_count");
        long earlySleepCount = earlySleepCountObj != null ? earlySleepCountObj.longValue() : 0;
        double earlySleepRatio = (double) earlySleepCount / totalCount;
        score -= (int) ((1 - earlySleepRatio) * 30);

        Number sleepTimeStdObj = (Number) stats.get("sleep_time_std");
        if (sleepTimeStdObj != null) {
            double sleepStd = sleepTimeStdObj.doubleValue();
            if (sleepStd > 60) {
                score -= Math.min(20, (int) ((sleepStd - 60) / 15));
            }
        }

        Number wakeTimeStdObj = (Number) stats.get("wake_time_std");
        if (wakeTimeStdObj != null) {
            double wakeStd = wakeTimeStdObj.doubleValue();
            if (wakeStd > 60) {
                score -= Math.min(20, (int) ((wakeStd - 60) / 15));
            }
        }

        return Math.max(0, Math.min(100, score));
    }

    public List<SleepRecord> getRecordsByDateRange(LocalDate startDate, LocalDate endDate) {
        QueryWrapper<SleepRecord> wrapper = new QueryWrapper<>();
        wrapper.between("sleep_date", startDate, endDate);
        wrapper.orderByDesc("sleep_date");
        return list(wrapper);
    }

    public Map<String, Object> getTodayStat() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        Map<String, Object> result = new HashMap<>();

        Map<String, Object> monthSummary = baseMapper.getSummary(startOfMonth, today);
        result.put("monthSummary", monthSummary);

        Map<String, Object> regularityStats = baseMapper.getRegularityStats(startOfMonth, today);
        int regularityScore = calculateRegularityScore(regularityStats);
        result.put("regularityScore", regularityScore);

        return result;
    }
}
