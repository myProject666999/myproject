package com.timestatistics.service;

import com.timestatistics.entity.TimeRecord;
import com.timestatistics.repository.TimeRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TimeRecordService {

    @Autowired
    private TimeRecordRepository timeRecordRepository;

    public List<TimeRecord> getRecordsByDate(LocalDate date) {
        return timeRecordRepository.findByRecordDateOrderByStartTimeDesc(date);
    }

    public List<TimeRecord> getRecordsByDateRange(LocalDate startDate, LocalDate endDate) {
        return timeRecordRepository.findByDateRange(startDate, endDate);
    }

    public TimeRecord createRecord(TimeRecord record) {
        LocalDateTime startTime = record.getStartTime();
        LocalDateTime endTime = record.getEndTime();
        long minutes = Duration.between(startTime, endTime).toMinutes();
        record.setDuration((int) minutes);
        record.setRecordDate(startTime.toLocalDate());
        record.setIsCrossDay(!startTime.toLocalDate().equals(endTime.toLocalDate()) ? 1 : 0);
        return timeRecordRepository.save(record);
    }

    public TimeRecord updateRecord(Long id, TimeRecord record) {
        record.setId(id);
        LocalDateTime startTime = record.getStartTime();
        LocalDateTime endTime = record.getEndTime();
        long minutes = Duration.between(startTime, endTime).toMinutes();
        record.setDuration((int) minutes);
        record.setRecordDate(startTime.toLocalDate());
        record.setIsCrossDay(!startTime.toLocalDate().equals(endTime.toLocalDate()) ? 1 : 0);
        return timeRecordRepository.save(record);
    }

    public void deleteRecord(Long id) {
        timeRecordRepository.deleteById(id);
    }

    public List<Map<String, Object>> getStatisticsByCategory(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = timeRecordRepository.sumDurationByCategoryAndDateRange(startDate, endDate);
        List<Map<String, Object>> statistics = new ArrayList<>();
        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("categoryId", result[0]);
            map.put("totalMinutes", result[1]);
            statistics.add(map);
        }
        return statistics;
    }

    public List<Map<String, Object>> getStatisticsByDate(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = timeRecordRepository.sumDurationByDate(startDate, endDate);
        List<Map<String, Object>> statistics = new ArrayList<>();
        for (Object[] result : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("date", result[0]);
            map.put("totalMinutes", result[1]);
            statistics.add(map);
        }
        return statistics;
    }
}
