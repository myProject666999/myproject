package com.insurance.controller;

import com.insurance.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "http://localhost:3000")
public class StatisticsController {
    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverviewStatistics() {
        return ResponseEntity.ok(statisticsService.getOverviewStatistics());
    }

    @GetMapping("/by-type")
    public ResponseEntity<List<Map<String, Object>>> getStatisticsByType() {
        return ResponseEntity.ok(statisticsService.getStatisticsByType());
    }
}
