package com.flashcard.controller;

import com.flashcard.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/statistics")
@CrossOrigin(origins = "http://localhost:8081")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping
    public Map<String, Object> getOverallStatistics() {
        return statisticsService.getOverallStatistics();
    }

    @GetMapping("/deck/{deckId}")
    public Map<String, Object> getDeckStatistics(@PathVariable Long deckId) {
        return statisticsService.getDeckStatistics(deckId);
    }
}
