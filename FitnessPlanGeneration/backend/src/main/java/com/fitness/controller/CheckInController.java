package com.fitness.controller;

import com.fitness.common.Result;
import com.fitness.dto.CheckInDTO;
import com.fitness.entity.CheckInRecord;
import com.fitness.entity.AdjustmentSuggestion;
import com.fitness.service.CheckInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/check-in")
public class CheckInController {

    @Autowired
    private CheckInService checkInService;

    @PostMapping("/check-in")
    public Result<CheckInRecord> checkIn(@RequestBody CheckInDTO dto) {
        try {
            CheckInRecord record = checkInService.checkIn(dto);
            return Result.success(record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public Result<List<CheckInRecord>> getByUserId(@PathVariable Long userId) {
        return Result.success(checkInService.getByUserId(userId));
    }

    @GetMapping("/daily-plan/{dailyPlanId}")
    public Result<CheckInRecord> getByDailyPlanId(@PathVariable Long dailyPlanId) {
        return Result.success(checkInService.getByDailyPlanId(dailyPlanId));
    }

    @PostMapping("/suggestions/{userId}/{dailyPlanId}")
    public Result<List<AdjustmentSuggestion>> generateSuggestions(
            @PathVariable Long userId,
            @PathVariable Long dailyPlanId) {
        return Result.success(checkInService.generateSuggestions(userId, dailyPlanId));
    }
}
