package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.entity.Schedule;
import com.votingscheduling.entity.ScheduleSlot;
import com.votingscheduling.security.JwtTokenProvider;
import com.votingscheduling.service.ScheduleService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/team/{teamId}")
    public Result<List<Schedule>> getByTeam(@PathVariable Long teamId) {
        return Result.success(scheduleService.findByTeamId(teamId));
    }

    @GetMapping("/team/{teamId}/status/{status}")
    public Result<List<Schedule>> getByTeamAndStatus(@PathVariable Long teamId, @PathVariable String status) {
        return Result.success(scheduleService.findByTeamIdAndStatus(teamId, status));
    }

    @GetMapping("/{id}")
    public Result<Schedule> getById(@PathVariable Long id) {
        return Result.success(scheduleService.findById(id));
    }

    @PostMapping
    public Result<Schedule> create(@RequestBody Schedule schedule, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(scheduleService.create(schedule, userId));
    }

    @PutMapping("/{id}")
    public Result<Schedule> update(@PathVariable Long id, @RequestBody Schedule schedule) {
        return Result.success(scheduleService.update(id, schedule));
    }

    @PostMapping("/{id}/generate-slots")
    public Result<List<ScheduleSlot>> generateSlots(@PathVariable Long id,
                                                     @RequestParam(defaultValue = "09:00") String startTime,
                                                     @RequestParam(defaultValue = "18:00") String endTime) {
        return Result.success(scheduleService.generateSlots(id,
                LocalTime.parse(startTime), LocalTime.parse(endTime)));
    }

    @PostMapping("/{id}/auto-assign")
    public Result<List<ScheduleSlot>> autoAssign(@PathVariable Long id) {
        return Result.success(scheduleService.autoAssign(id));
    }

    @PostMapping("/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        scheduleService.publish(id);
        return Result.success();
    }

    @PostMapping("/{id}/archive")
    public Result<Void> archive(@PathVariable Long id) {
        scheduleService.archive(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        scheduleService.delete(id);
        return Result.success();
    }
}
