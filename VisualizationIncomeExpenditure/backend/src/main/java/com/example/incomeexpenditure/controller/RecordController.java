package com.example.incomeexpenditure.controller;

import com.example.incomeexpenditure.common.Result;
import com.example.incomeexpenditure.entity.Record;
import com.example.incomeexpenditure.service.RecordService;
import com.example.incomeexpenditure.vo.DailyStatsVO;
import com.example.incomeexpenditure.vo.DayDetailVO;
import com.example.incomeexpenditure.vo.MonthStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/records")
public class RecordController {

    @Autowired
    private RecordService recordService;

    private static final Long DEFAULT_USER_ID = 1L;

    @PostMapping
    public Result<?> addRecord(@RequestBody Record record) {
        record.setUserId(DEFAULT_USER_ID);
        int result = recordService.addRecord(record);
        return result > 0 ? Result.success() : Result.error("添加失败");
    }

    @PutMapping
    public Result<?> updateRecord(@RequestBody Record record) {
        int result = recordService.updateRecord(record);
        return result > 0 ? Result.success() : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<?> deleteRecord(@PathVariable Long id) {
        int result = recordService.deleteRecord(id);
        return result > 0 ? Result.success() : Result.error("删除失败");
    }

    @GetMapping("/{id}")
    public Result<Record> getRecordById(@PathVariable Long id) {
        return Result.success(recordService.getRecordById(id));
    }

    @GetMapping("/day/{date}")
    public Result<DayDetailVO> getDayDetail(@PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(recordService.getDayDetail(DEFAULT_USER_ID, date));
    }

    @GetMapping("/month")
    public Result<MonthStatsVO> getMonthStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(recordService.getMonthStats(DEFAULT_USER_ID, startDate, endDate));
    }

    @GetMapping("/daily")
    public Result<List<DailyStatsVO>> getDailyStats(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(recordService.getDailyStats(DEFAULT_USER_ID, startDate, endDate));
    }

    @GetMapping("/top-expense")
    public Result<List<DailyStatsVO>> getTopExpenseDays(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.success(recordService.getTopExpenseDays(DEFAULT_USER_ID, startDate, endDate, limit));
    }
}
