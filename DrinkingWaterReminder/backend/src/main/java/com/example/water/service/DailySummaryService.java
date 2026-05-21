package com.example.water.service;

import com.example.water.entity.DailySummary;
import com.example.water.entity.UserSetting;
import com.example.water.repository.DailySummaryRepository;
import com.example.water.repository.WaterRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DailySummaryService {

    @Autowired
    private DailySummaryRepository dailySummaryRepository;

    @Autowired
    private WaterRecordRepository waterRecordRepository;

    @Autowired
    private UserSettingService userSettingService;

    @Transactional
    public DailySummary updateTodaySummary() {
        LocalDate today = LocalDate.now();
        UserSetting setting = userSettingService.getUserSetting();

        Integer totalAmount = waterRecordRepository.sumAmountByDate(today);
        if (totalAmount == null) {
            totalAmount = 0;
        }

        Optional<DailySummary> existing = dailySummaryRepository.findBySummaryDate(today);

        DailySummary summary;
        if (existing.isPresent()) {
            summary = existing.get();
            summary.setTotalAmount(totalAmount);
            summary.setTargetAmount(setting.getDailyTarget());
            summary.setIsAchieved(totalAmount >= setting.getDailyTarget());
        } else {
            summary = new DailySummary();
            summary.setSummaryDate(today);
            summary.setTotalAmount(totalAmount);
            summary.setTargetAmount(setting.getDailyTarget());
            summary.setIsAchieved(totalAmount >= setting.getDailyTarget());
        }

        return dailySummaryRepository.save(summary);
    }

    public DailySummary getTodaySummary() {
        LocalDate today = LocalDate.now();
        return dailySummaryRepository.findBySummaryDate(today).orElseGet(() -> {
            DailySummary summary = new DailySummary();
            summary.setSummaryDate(today);
            summary.setTotalAmount(0);
            UserSetting setting = userSettingService.getUserSetting();
            summary.setTargetAmount(setting.getDailyTarget());
            summary.setIsAchieved(false);
            return summary;
        });
    }

    public List<DailySummary> getWeeklySummaries() {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6);
        return dailySummaryRepository.findBySummaryDateBetweenOrderBySummaryDateAsc(startDate, endDate);
    }

    public Map<String, Object> getStatistics() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.minusDays(29);

        Map<String, Object> stats = new HashMap<>();

        List<DailySummary> weeklyData = dailySummaryRepository.findBySummaryDateBetweenOrderBySummaryDateAsc(weekStart, today);
        Long weeklyAchieved = dailySummaryRepository.countAchievedBetweenDates(weekStart, today);
        Long monthlyAchieved = dailySummaryRepository.countAchievedBetweenDates(monthStart, today);

        stats.put("weeklyData", weeklyData);
        stats.put("weeklyAchievedDays", weeklyAchieved);
        stats.put("monthlyAchievedDays", monthlyAchieved);
        stats.put("continuousDays", getContinuousAchievedDays());

        return stats;
    }

    public Integer getContinuousAchievedDays() {
        int continuousDays = 0;
        LocalDate today = LocalDate.now();

        for (LocalDate date = today; !date.isBefore(today.minusDays(30)); date = date.minusDays(1)) {
            Optional<DailySummary> summary = dailySummaryRepository.findBySummaryDate(date);
            if (summary.isPresent() && summary.get().getIsAchieved()) {
                continuousDays++;
            } else if (!date.equals(today)) {
                break;
            }
        }

        return continuousDays;
    }
}
