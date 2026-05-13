package com.court.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.court.reservation.common.Result;
import com.court.reservation.entity.Match;
import com.court.reservation.entity.MatchPlayer;
import com.court.reservation.mapper.MatchMapper;
import com.court.reservation.mapper.MatchPlayerMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/match")
public class MatchController {

    @Resource
    private MatchMapper matchMapper;

    @Resource
    private MatchPlayerMapper matchPlayerMapper;

    @GetMapping("/list")
    public Result<List<Match>> list(
            @RequestParam(required = false) String sportType,
            @RequestParam(required = false) String date) {
        QueryWrapper<Match> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        if (sportType != null && !sportType.isEmpty()) {
            wrapper.eq("sport_type", sportType);
        }
        if (date != null && !date.isEmpty()) {
            wrapper.eq("date", LocalDate.parse(date));
        }
        wrapper.orderByDesc("create_time");
        return Result.success(matchMapper.selectList(wrapper));
    }

    @GetMapping("/my")
    public Result<List<Match>> myMatches(@RequestParam Long userId) {
        QueryWrapper<Match> wrapper = new QueryWrapper<>();
        wrapper.eq("initiator_id", userId).orderByDesc("create_time");
        return Result.success(matchMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Match> getById(@PathVariable Long id) {
        return Result.success(matchMapper.selectById(id));
    }

    @GetMapping("/{id}/players")
    public Result<List<MatchPlayer>> getPlayers(@PathVariable Long id) {
        QueryWrapper<MatchPlayer> wrapper = new QueryWrapper<>();
        wrapper.eq("match_id", id).orderByAsc("join_time");
        return Result.success(matchPlayerMapper.selectList(wrapper));
    }

    @PostMapping
    @Transactional
    public Result<Match> create(@RequestBody Match match) {
        match.setCurrentPlayers(1);
        match.setStatus(1);
        match.setCreateTime(LocalDateTime.now());
        match.setUpdateTime(LocalDateTime.now());
        matchMapper.insert(match);

        MatchPlayer player = new MatchPlayer();
        player.setMatchId(match.getId());
        player.setUserId(match.getInitiatorId());
        player.setStatus(1);
        player.setJoinTime(LocalDateTime.now());
        matchPlayerMapper.insert(player);

        return Result.success(match);
    }

    @PostMapping("/{id}/join")
    @Transactional
    public Result<MatchPlayer> joinMatch(@PathVariable Long id, @RequestParam Long userId) {
        Match match = matchMapper.selectById(id);
        if (match == null) {
            throw new RuntimeException("拼场不存在");
        }
        if (match.getStatus() != 1) {
            throw new RuntimeException("拼场已结束");
        }
        if (match.getCurrentPlayers() >= match.getMaxPlayers()) {
            throw new RuntimeException("拼场人数已满");
        }

        QueryWrapper<MatchPlayer> checkWrapper = new QueryWrapper<>();
        checkWrapper.eq("match_id", id).eq("user_id", userId);
        if (matchPlayerMapper.selectCount(checkWrapper) > 0) {
            throw new RuntimeException("已加入该拼场");
        }

        MatchPlayer player = new MatchPlayer();
        player.setMatchId(id);
        player.setUserId(userId);
        player.setStatus(1);
        player.setJoinTime(LocalDateTime.now());
        matchPlayerMapper.insert(player);

        match.setCurrentPlayers(match.getCurrentPlayers() + 1);
        if (match.getCurrentPlayers() >= match.getMaxPlayers()) {
            match.setStatus(2);
        }
        match.setUpdateTime(LocalDateTime.now());
        matchMapper.updateById(match);

        return Result.success(player);
    }

    @DeleteMapping("/{id}/leave")
    @Transactional
    public Result<Void> leaveMatch(@PathVariable Long id, @RequestParam Long userId) {
        Match match = matchMapper.selectById(id);
        if (match == null) {
            throw new RuntimeException("拼场不存在");
        }
        if (match.getInitiatorId().equals(userId)) {
            throw new RuntimeException("发起人不能离开拼场");
        }

        QueryWrapper<MatchPlayer> wrapper = new QueryWrapper<>();
        wrapper.eq("match_id", id).eq("user_id", userId);
        matchPlayerMapper.delete(wrapper);

        match.setCurrentPlayers(Math.max(1, match.getCurrentPlayers() - 1));
        if (match.getStatus() == 2 && match.getCurrentPlayers() < match.getMaxPlayers()) {
            match.setStatus(1);
        }
        match.setUpdateTime(LocalDateTime.now());
        matchMapper.updateById(match);

        return Result.success();
    }

    @PutMapping("/{id}")
    public Result<Match> update(@PathVariable Long id, @RequestBody Match match) {
        match.setId(id);
        match.setUpdateTime(LocalDateTime.now());
        matchMapper.updateById(match);
        return Result.success(match);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        matchMapper.deleteById(id);
        QueryWrapper<MatchPlayer> wrapper = new QueryWrapper<>();
        wrapper.eq("match_id", id);
        matchPlayerMapper.delete(wrapper);
        return Result.success();
    }
}