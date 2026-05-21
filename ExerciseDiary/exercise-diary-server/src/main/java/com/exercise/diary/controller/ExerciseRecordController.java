package com.exercise.diary.controller;

import com.exercise.diary.common.Result;
import com.exercise.diary.entity.ExerciseRecord;
import com.exercise.diary.service.ExerciseRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/record")
@CrossOrigin
public class ExerciseRecordController {

    @Autowired
    private ExerciseRecordService exerciseRecordService;

    @GetMapping("/today")
    public Result<List<ExerciseRecord>> getTodayRecords(@RequestParam(defaultValue = "1") Long userId) {
        return Result.success(exerciseRecordService.getTodayRecords(userId));
    }

    @GetMapping("/history")
    public Result<List<ExerciseRecord>> getHistory(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return Result.success(exerciseRecordService.getHistory(userId, page, size));
    }

    @GetMapping("/daily")
    public Result<Map<String, Object>> getDailyStats(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return Result.success(exerciseRecordService.getDailyStats(userId, date));
    }

    @GetMapping("/monthly")
    public Result<Map<String, Object>> getMonthlyStats(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        if (month == null) {
            month = LocalDate.now().getMonthValue();
        }
        return Result.success(exerciseRecordService.getMonthlyStats(userId, year, month));
    }

    @PostMapping
    public Result<ExerciseRecord> addRecord(@RequestBody ExerciseRecord record) {
        return Result.success(exerciseRecordService.addRecord(record));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteRecord(@PathVariable Long id) {
        return Result.success(exerciseRecordService.removeById(id));
    }

}
