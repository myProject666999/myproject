package com.gamelibrary.controller;

import com.gamelibrary.common.Result;
import com.gamelibrary.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/statistics")
@CrossOrigin
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/user/{userId}")
    public Result<Map<String, Object>> getUserStatistics(@PathVariable Long userId) {
        return Result.success(statisticsService.getUserStatistics(userId));
    }
}
