package com.diary.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.diary.common.Result;
import com.diary.dto.DiaryDTO;
import com.diary.entity.Diary;
import com.diary.service.DiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/diary")
public class DiaryController {

    @Autowired
    private DiaryService diaryService;

    @PostMapping
    public Result<Diary> saveDiary(@Validated @RequestBody DiaryDTO dto) {
        if (dto.getDiaryDate() == null) {
            dto.setDiaryDate(LocalDate.now());
        }
        Diary diary = diaryService.saveDiary(dto);
        return Result.success(diary);
    }

    @GetMapping("/today")
    public Result<Diary> getTodayDiary(@RequestParam(defaultValue = "1") Long userId) {
        Diary diary = diaryService.getTodayDiary(userId);
        return Result.success(diary);
    }

    @GetMapping("/{id}")
    public Result<Diary> getDiaryById(@PathVariable Long id) {
        Diary diary = diaryService.getDiaryById(id);
        return Result.success(diary);
    }

    @GetMapping("/list")
    public Result<Page<Diary>> getDiaryList(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Diary> result = diaryService.getDiaryList(userId, page, size);
        return Result.success(result);
    }

    @GetMapping("/trend/monthly")
    public Result<List<Map<String, Object>>> getMonthlyMoodTrend(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        if (year == null) year = now.getYear();
        if (month == null) month = now.getMonthValue();
        List<Map<String, Object>> result = diaryService.getMonthlyMoodTrend(userId, year, month);
        return Result.success(result);
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> getMoodStatistics(
            @RequestParam(defaultValue = "1") Long userId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        if (year == null) year = now.getYear();
        if (month == null) month = now.getMonthValue();
        Map<String, Object> result = diaryService.getMoodStatistics(userId, year, month);
        return Result.success(result);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDiary(@PathVariable Long id) {
        diaryService.deleteDiary(id);
        return Result.success();
    }
}
