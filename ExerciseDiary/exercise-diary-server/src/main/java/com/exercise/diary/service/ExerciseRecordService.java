package com.exercise.diary.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.exercise.diary.entity.ExerciseRecord;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ExerciseRecordService extends IService<ExerciseRecord> {

    List<ExerciseRecord> getTodayRecords(Long userId);

    List<ExerciseRecord> getHistory(Long userId, Integer page, Integer size);

    BigDecimal calculateCalories(Long exerciseTypeId, Integer duration, Long userId);

    ExerciseRecord addRecord(ExerciseRecord record);

    Map<String, Object> getDailyStats(Long userId, LocalDate date);

    Map<String, Object> getMonthlyStats(Long userId, Integer year, Integer month);

}
