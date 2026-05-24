package com.example.complaint.controller;

import com.example.complaint.common.Result;
import com.example.complaint.dto.StatisticsDTO;
import com.example.complaint.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping
    public Result<StatisticsDTO> getStatistics() {
        return Result.success(statisticsService.getStatistics());
    }
}
