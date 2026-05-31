package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.entity.AvailableTime;
import com.votingscheduling.security.JwtTokenProvider;
import com.votingscheduling.service.AvailableTimeService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/available-times")
@RequiredArgsConstructor
public class AvailableTimeController {

    private final AvailableTimeService availableTimeService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/team/{teamId}")
    public Result<List<AvailableTime>> getByTeam(@PathVariable Long teamId) {
        return Result.success(availableTimeService.findByTeam(teamId));
    }

    @GetMapping("/team/{teamId}/my")
    public Result<List<AvailableTime>> getMyAvailableTimes(@PathVariable Long teamId, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(availableTimeService.findByTeamAndUser(teamId, userId));
    }

    @GetMapping("/team/{teamId}/weekday/{weekDay}")
    public Result<List<AvailableTime>> getByTeamAndWeekDay(@PathVariable Long teamId, @PathVariable Integer weekDay) {
        return Result.success(availableTimeService.findByTeamAndWeekDay(teamId, weekDay));
    }

    @PostMapping("/team/{teamId}/my")
    public Result<List<AvailableTime>> saveMyAvailableTimes(@PathVariable Long teamId,
                                                            @RequestBody List<AvailableTime> times,
                                                            HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(availableTimeService.saveAll(teamId, userId, times));
    }
}
