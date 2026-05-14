package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.CatchRecord;
import com.fishing.reservation.entity.User;
import com.fishing.reservation.mapper.CatchRecordMapper;
import com.fishing.reservation.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private CatchRecordMapper catchRecordMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/today")
    public Result<List<Map<String, Object>>> today() {
        return getLeaderboard("DAY");
    }

    @GetMapping("/week")
    public Result<List<Map<String, Object>>> week() {
        return getLeaderboard("WEEK");
    }

    @GetMapping("/month")
    public Result<List<Map<String, Object>>> month() {
        return getLeaderboard("MONTH");
    }

    private Result<List<Map<String, Object>>> getLeaderboard(String period) {
        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        switch (period) {
            case "WEEK":
                start = LocalDate.now().minusDays(6).atStartOfDay();
                break;
            case "MONTH":
                start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
                break;
            default:
                start = LocalDate.now().atStartOfDay();
        }

        List<CatchRecord> records = catchRecordMapper.selectList(
            new LambdaQueryWrapper<CatchRecord>()
                .between(CatchRecord::getWeighTime, start, end)
                .eq(CatchRecord::getStatus, 1)
        );

        Map<Long, List<CatchRecord>> grouped = records.stream()
            .collect(Collectors.groupingBy(CatchRecord::getUserId));

        List<Map<String, Object>> leaderboard = new ArrayList<>();

        for (Map.Entry<Long, List<CatchRecord>> entry : grouped.entrySet()) {
            Long userId = entry.getKey();
            List<CatchRecord> userRecords = entry.getValue();

            User user = userMapper.selectById(userId);
            if (user == null) continue;

            BigDecimal totalWeight = userRecords.stream()
                .map(CatchRecord::getWeight)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalValue = userRecords.stream()
                .map(CatchRecord::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> item = new HashMap<>();
            item.put("userId", userId);
            item.put("nickname", user.getNickname());
            item.put("totalWeight", totalWeight);
            item.put("totalValue", totalValue);
            item.put("fishCount", userRecords.size());
            leaderboard.add(item);
        }

        leaderboard.sort((a, b) -> ((BigDecimal) b.get("totalWeight")).compareTo((BigDecimal) a.get("totalWeight")));

        for (int i = 0; i < leaderboard.size(); i++) {
            leaderboard.get(i).put("ranking", i + 1);
        }

        return Result.success(leaderboard);
    }
}
