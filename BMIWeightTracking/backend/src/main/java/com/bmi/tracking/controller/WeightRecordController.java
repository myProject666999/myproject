package com.bmi.tracking.controller;

import com.bmi.tracking.common.Result;
import com.bmi.tracking.entity.WeightRecord;
import com.bmi.tracking.service.WeightRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/weight")
public class WeightRecordController {

    @Autowired
    private WeightRecordService weightRecordService;

    @PostMapping
    public Result<Void> add(@RequestBody Map<String, Object> body) {
        BigDecimal weight = new BigDecimal(body.get("weight").toString());
        LocalDate date = body.get("recordDate") != null
                ? LocalDate.parse(body.get("recordDate").toString())
                : LocalDate.now();
        String note = body.get("note") != null ? body.get("note").toString() : null;
        weightRecordService.addRecord(weight, date, note);
        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BigDecimal weight = new BigDecimal(body.get("weight").toString());
        String note = body.get("note") != null ? body.get("note").toString() : null;
        weightRecordService.updateRecord(id, weight, note);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        weightRecordService.deleteRecord(id);
        return Result.success();
    }

    @GetMapping("/list")
    public Result<List<WeightRecord>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return Result.success(weightRecordService.listRecords(start, end));
    }

    @GetMapping("/trend")
    public Result<Map<String, Object>> trend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false, defaultValue = "7") Integer maDays) {
        return Result.success(weightRecordService.getTrend(start, end, maDays));
    }
}
