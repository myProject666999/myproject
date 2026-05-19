package com.timestatistics.controller;

import com.timestatistics.entity.TimeRecord;
import com.timestatistics.service.TimeRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class TimeRecordController {

    @Autowired
    private TimeRecordService timeRecordService;

    @GetMapping("/date/{date}")
    public ResponseEntity<List<TimeRecord>> getRecordsByDate(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return ResponseEntity.ok(timeRecordService.getRecordsByDate(date));
    }

    @GetMapping("/range")
    public ResponseEntity<List<TimeRecord>> getRecordsByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return ResponseEntity.ok(timeRecordService.getRecordsByDateRange(startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<TimeRecord> createRecord(@RequestBody TimeRecord record) {
        return ResponseEntity.ok(timeRecordService.createRecord(record));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimeRecord> updateRecord(@PathVariable Long id, @RequestBody TimeRecord record) {
        return ResponseEntity.ok(timeRecordService.updateRecord(id, record));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        timeRecordService.deleteRecord(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics/category")
    public ResponseEntity<List<Map<String, Object>>> getStatisticsByCategory(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return ResponseEntity.ok(timeRecordService.getStatisticsByCategory(startDate, endDate));
    }

    @GetMapping("/statistics/date")
    public ResponseEntity<List<Map<String, Object>>> getStatisticsByDate(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return ResponseEntity.ok(timeRecordService.getStatisticsByDate(startDate, endDate));
    }
}
