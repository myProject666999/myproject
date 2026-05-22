package com.sleeprecord.controller;

import com.sleeprecord.common.Result;
import com.sleeprecord.dto.SleepRecordDTO;
import com.sleeprecord.entity.SleepRecord;
import com.sleeprecord.service.SleepRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sleep")
@CrossOrigin(origins = "*")
public class SleepRecordController {

    @Autowired
    private SleepRecordService sleepRecordService;

    @PostMapping("/record")
    public Result<SleepRecord> createRecord(@RequestBody SleepRecordDTO dto) {
        try {
            SleepRecord record = sleepRecordService.createRecord(dto);
            return Result.success(record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/record/{id}")
    public Result<SleepRecord> updateRecord(@PathVariable Long id, @RequestBody SleepRecordDTO dto) {
        try {
            SleepRecord record = sleepRecordService.updateRecord(id, dto);
            return Result.success(record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/record/{id}")
    public Result<String> deleteRecord(@PathVariable Long id) {
        try {
            sleepRecordService.removeById(id);
            return Result.success("删除成功", null);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/record/{id}")
    public Result<SleepRecord> getRecord(@PathVariable Long id) {
        try {
            SleepRecord record = sleepRecordService.getById(id);
            if (record == null) {
                return Result.error("记录不存在");
            }
            return Result.success(record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/records")
    public Result<List<SleepRecord>> getRecords(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        try {
            List<SleepRecord> records = sleepRecordService.getRecordsByDateRange(startDate, endDate);
            return Result.success(records);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/report")
    public Result<Map<String, Object>> getReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        try {
            Map<String, Object> report = sleepRecordService.getReport(startDate, endDate);
            return Result.success(report);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/today")
    public Result<Map<String, Object>> getTodayStat() {
        try {
            Map<String, Object> stat = sleepRecordService.getTodayStat();
            return Result.success(stat);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
