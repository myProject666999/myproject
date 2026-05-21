package com.example.water.controller;

import com.example.water.entity.WaterRecord;
import com.example.water.service.WaterRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water")
@CrossOrigin(origins = "*")
public class WaterRecordController {

    @Autowired
    private WaterRecordService waterRecordService;

    @PostMapping("/drink")
    public ResponseEntity<WaterRecord> drink(@RequestBody Map<String, Integer> body) {
        Integer amount = body.getOrDefault("amount", 200);
        return ResponseEntity.ok(waterRecordService.addRecord(amount));
    }

    @GetMapping("/today")
    public ResponseEntity<List<WaterRecord>> getTodayRecords() {
        return ResponseEntity.ok(waterRecordService.getTodayRecords());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<WaterRecord>> getRecordsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(waterRecordService.getRecordsByDate(date));
    }

    @GetMapping("/today/total")
    public ResponseEntity<Map<String, Object>> getTodayTotal() {
        Integer total = waterRecordService.getTodayTotal();
        Map<String, Object> result = new HashMap<>();
        result.put("date", LocalDate.now());
        result.put("totalAmount", total);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/weekly")
    public ResponseEntity<Map<String, Object>> getWeeklyData() {
        Map<String, Object> result = new HashMap<>();
        result.put("weeklyData", waterRecordService.getWeeklyTotal());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        waterRecordService.deleteRecord(id);
        return ResponseEntity.ok().build();
    }
}
