package com.example.water.service;

import com.example.water.entity.WaterRecord;
import com.example.water.repository.WaterRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WaterRecordService {

    @Autowired
    private WaterRecordRepository waterRecordRepository;

    @Autowired
    private DailySummaryService dailySummaryService;

    @Transactional
    public WaterRecord addRecord(Integer amount) {
        WaterRecord record = new WaterRecord();
        record.setAmount(amount);
        record.setRecordDate(LocalDate.now());
        record.setRecordTime(LocalTime.now());
        WaterRecord saved = waterRecordRepository.save(record);

        dailySummaryService.updateTodaySummary();

        return saved;
    }

    public List<WaterRecord> getTodayRecords() {
        return waterRecordRepository.findByRecordDateOrderByRecordTimeAsc(LocalDate.now());
    }

    public List<WaterRecord> getRecordsByDate(LocalDate date) {
        return waterRecordRepository.findByRecordDateOrderByRecordTimeAsc(date);
    }

    public Integer getTodayTotal() {
        Integer total = waterRecordRepository.sumAmountByDate(LocalDate.now());
        return total != null ? total : 0;
    }

    public Map<LocalDate, Integer> getWeeklyTotal() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);

        List<Object[]> results = waterRecordRepository.sumAmountBetweenDates(startDate, endDate);

        Map<LocalDate, Integer> weeklyData = new HashMap<>();
        for (Object[] result : results) {
            LocalDate date = (LocalDate) result[0];
            Integer total = ((Number) result[1]).intValue();
            weeklyData.put(date, total);
        }

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            weeklyData.putIfAbsent(date, 0);
        }

        return weeklyData;
    }

    @Transactional
    public void deleteRecord(Long id) {
        waterRecordRepository.deleteById(id);
        dailySummaryService.updateTodaySummary();
    }
}
