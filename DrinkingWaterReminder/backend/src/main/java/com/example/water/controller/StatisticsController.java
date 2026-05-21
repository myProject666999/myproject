package com.example.water.controller;

import com.example.water.entity.DailySummary;
import com.example.water.service.DailySummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    @Autowired
    private DailySummaryService dailySummaryService;

    @GetMapping("/today")
    public ResponseEntity<DailySummary> getTodaySummary() {
        return ResponseEntity.ok(dailySummaryService.getTodaySummary());
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<DailySummary>> getWeeklySummaries() {
        return ResponseEntity.ok(dailySummaryService.getWeeklySummaries());
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(dailySummaryService.getStatistics());
    }

    @GetMapping("/continuous")
    public ResponseEntity<Map<String, Object>> getContinuousDays() {
        Integer days = dailySummaryService.getContinuousAchievedDays();
        return ResponseEntity.ok(Map.of("continuousDays", days));
    }
}
