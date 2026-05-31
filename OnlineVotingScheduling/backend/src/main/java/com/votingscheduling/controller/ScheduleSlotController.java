package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.entity.ScheduleSlot;
import com.votingscheduling.security.JwtTokenProvider;
import com.votingscheduling.service.ScheduleService;
import com.votingscheduling.service.ScheduleSlotService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedule-slots")
@RequiredArgsConstructor
public class ScheduleSlotController {

    private final ScheduleSlotService scheduleSlotService;
    private final ScheduleService scheduleService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/schedule/{scheduleId}")
    public Result<List<ScheduleSlot>> getBySchedule(@PathVariable Long scheduleId) {
        return Result.success(scheduleSlotService.findByScheduleId(scheduleId));
    }

    @GetMapping("/schedule/{scheduleId}/range")
    public Result<List<ScheduleSlot>> getByScheduleAndRange(
            @PathVariable Long scheduleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return Result.success(scheduleSlotService.findByScheduleIdAndDateRange(scheduleId, startDate, endDate));
    }

    @GetMapping("/my")
    public Result<List<ScheduleSlot>> getMySlots(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        if (startDate != null && endDate != null) {
            return Result.success(scheduleSlotService.findByUserIdAndDateRange(userId, startDate, endDate));
        }
        return Result.success(scheduleSlotService.findByUserId(userId));
    }

    @GetMapping("/user/{userId}")
    public Result<List<ScheduleSlot>> getByUser(@PathVariable Long userId) {
        return Result.success(scheduleSlotService.findByUserId(userId));
    }

    @PutMapping("/{id}/assign/{userId}")
    public Result<ScheduleSlot> assignSlot(@PathVariable Long id, @PathVariable Long userId,
                                            HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long operatorId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(scheduleService.assignSlot(id, userId, operatorId));
    }
}
