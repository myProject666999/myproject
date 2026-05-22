package com.bmi.tracking.service;

import com.bmi.tracking.entity.WeightRecord;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface WeightRecordService {
    void addRecord(BigDecimal weight, LocalDate recordDate, String note);
    void updateRecord(Long id, BigDecimal weight, String note);
    void deleteRecord(Long id);
    List<WeightRecord> listRecords(LocalDate start, LocalDate end);
    Map<String, Object> getTrend(LocalDate start, LocalDate end, Integer maDays);
}
