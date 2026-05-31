package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.entity.Team;
import com.votingscheduling.entity.User;
import com.votingscheduling.security.JwtTokenProvider;
import com.votingscheduling.service.TeamService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public Result<List<Team>> getAll() {
        return Result.success(teamService.findAll());
    }

    @GetMapping("/{id}")
    public Result<Team> getById(@PathVariable Long id) {
        return Result.success(teamService.findById(id));
    }

    @GetMapping("/my")
    public Result<List<Team>> getMyTeams(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(teamService.getUserTeams(userId));
    }

    @PostMapping
    public Result<Team> create(@RequestBody Team team, HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return Result.success(teamService.create(team, userId));
    }

    @PutMapping("/{id}")
    public Result<Team> update(@PathVariable Long id, @RequestBody Team team) {
        return Result.success(teamService.update(id, team));
    }

    @GetMapping("/{id}/members")
    public Result<List<User>> getMembers(@PathVariable Long id) {
        return Result.success(teamService.getTeamMembers(id));
    }

    @PostMapping("/{id}/members/{userId}")
    public Result<Void> addMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.addMember(id, userId);
        return Result.success();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public Result<Void> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        teamService.removeMember(id, userId);
        return Result.success();
    }
}
