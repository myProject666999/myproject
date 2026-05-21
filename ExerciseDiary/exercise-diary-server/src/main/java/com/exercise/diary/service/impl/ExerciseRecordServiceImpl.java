package com.exercise.diary.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.exercise.diary.entity.ExerciseRecord;
import com.exercise.diary.entity.ExerciseType;
import com.exercise.diary.entity.User;
import com.exercise.diary.mapper.ExerciseRecordMapper;
import com.exercise.diary.mapper.ExerciseTypeMapper;
import com.exercise.diary.mapper.UserMapper;
import com.exercise.diary.service.ExerciseRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
public class ExerciseRecordServiceImpl extends ServiceImpl<ExerciseRecordMapper, ExerciseRecord> implements ExerciseRecordService {

    @Autowired
    private ExerciseTypeMapper exerciseTypeMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    public List<ExerciseRecord> getTodayRecords(Long userId) {
        return baseMapper.selectByDate(userId, LocalDate.now());
    }

    @Override
    public List<ExerciseRecord> getHistory(Long userId, Integer page, Integer size) {
        Integer offset = (page - 1) * size;
        return baseMapper.selectHistory(userId, offset, size);
    }

    @Override
    public BigDecimal calculateCalories(Long exerciseTypeId, Integer duration, Long userId) {
        ExerciseType type = exerciseTypeMapper.selectById(exerciseTypeId);
        User user = userMapper.selectById(userId);
        if (type == null || user == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal hours = BigDecimal.valueOf(duration).divide(BigDecimal.valueOf(60), 4, RoundingMode.HALF_UP);
        return type.getMet().multiply(user.getWeight()).multiply(hours).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public ExerciseRecord addRecord(ExerciseRecord record) {
        if (record.getCalories() == null) {
            record.setCalories(calculateCalories(record.getExerciseTypeId(), record.getDuration(), record.getUserId()));
        }
        if (record.getExerciseDate() == null) {
            record.setExerciseDate(LocalDate.now());
        }
        save(record);
        return record;
    }

    @Override
    public Map<String, Object> getDailyStats(Long userId, LocalDate date) {
        Map<String, Object> result = new HashMap<>();
        List<ExerciseRecord> records = baseMapper.selectByDate(userId, date);
        BigDecimal totalCalories = records.stream()
                .map(ExerciseRecord::getCalories)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Integer totalDuration = records.stream()
                .mapToInt(ExerciseRecord::getDuration)
                .sum();
        result.put("records", records);
        result.put("totalCalories", totalCalories);
        result.put("totalDuration", totalDuration);
        return result;
    }

    @Override
    public Map<String, Object> getMonthlyStats(Long userId, Integer year, Integer month) {
        Map<String, Object> result = new HashMap<>();
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal totalCalories = baseMapper.sumCaloriesByDateRange(userId, startDate, endDate);
        Integer totalDuration = baseMapper.sumDurationByDateRange(userId, startDate, endDate);
        Integer exerciseDays = baseMapper.countExerciseDays(userId, startDate, endDate);
        List<Map<String, Object>> dailyCalories = baseMapper.selectDailyCalories(userId, startDate, endDate);
        List<Map<String, Object>> categoryStats = baseMapper.selectCategoryStats(userId, startDate, endDate);

        result.put("totalCalories", totalCalories);
        result.put("totalDuration", totalDuration);
        result.put("exerciseDays", exerciseDays);
        result.put("dailyCalories", dailyCalories);
        result.put("categoryStats", categoryStats);
        return result;
    }

}
