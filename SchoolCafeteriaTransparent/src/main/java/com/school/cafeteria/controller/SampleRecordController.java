package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.SampleRecord;
import com.school.cafeteria.service.SampleRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sample")
public class SampleRecordController {

    @Autowired
    private SampleRecordService sampleRecordService;

    @GetMapping("/public/list")
    public Result<List<SampleRecord>> getAll() {
        List<SampleRecord> list = sampleRecordService.findAll();
        return Result.success(list);
    }

    @GetMapping("/public/{id}")
    public Result<SampleRecord> getById(@PathVariable Long id) {
        Optional<SampleRecord> record = sampleRecordService.findById(id);
        return record.map(Result::success).orElse(Result.error("记录不存在"));
    }

    @GetMapping("/public/date/{date}")
    public Result<List<SampleRecord>> getByDate(@PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        List<SampleRecord> list = sampleRecordService.findByDate(date);
        return Result.success(list);
    }

    @GetMapping("/public/range")
    public Result<List<SampleRecord>> getByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<SampleRecord> list = sampleRecordService.findByDateRange(startDate, endDate);
        return Result.success(list);
    }

    @GetMapping("/public/search")
    public Result<List<SampleRecord>> search(@RequestParam String keyword) {
        List<SampleRecord> list = sampleRecordService.searchByDishName(keyword);
        return Result.success(list);
    }

    @PostMapping
    public Result<SampleRecord> create(@RequestBody SampleRecord record) {
        SampleRecord saved = sampleRecordService.save(record);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<SampleRecord> update(@PathVariable Long id, @RequestBody SampleRecord record) {
        Optional<SampleRecord> existing = sampleRecordService.findById(id);
        if (!existing.isPresent()) {
            return Result.error("记录不存在");
        }
        record.setId(id);
        SampleRecord saved = sampleRecordService.save(record);
        return Result.success("更新成功", saved);
    }

    @PostMapping("/{id}/disposal")
    public Result<SampleRecord> disposal(
            @PathVariable Long id,
            @RequestParam String disposalPerson,
            @RequestParam(required = false) String disposalImage) {
        SampleRecord updated = sampleRecordService.disposal(id, disposalPerson, disposalImage);
        if (updated == null) {
            return Result.error("记录不存在");
        }
        return Result.success("销毁成功", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sampleRecordService.delete(id);
        return Result.success();
    }
}
