package com.habit.tracking.controller;

import com.habit.tracking.entity.Habit;
import com.habit.tracking.service.HabitService;
import com.habit.tracking.vo.HabitCheckinVO;
import com.habit.tracking.vo.HeatmapDataVO;
import com.habit.tracking.vo.RankingVO;
import com.habit.tracking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    @GetMapping
    public Result<List<Habit>> listHabits() {
        return Result.success(habitService.listHabits());
    }

    @GetMapping("/today")
    public Result<List<HabitCheckinVO>> listTodayHabits() {
        return Result.success(habitService.listTodayHabits());
    }

    @PostMapping("/{id}/checkin")
    public Result<?> checkin(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String remark = body != null ? body.get("remark") : null;
        return Result.success(habitService.checkin(id, remark));
    }

    @DeleteMapping("/{id}/checkin")
    public Result<?> cancelCheckin(@PathVariable Long id) {
        habitService.cancelCheckin(id);
        return Result.success();
    }

    @GetMapping("/heatmap")
    public Result<List<HeatmapDataVO>> getHeatmap(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        LocalDate now = LocalDate.now();
        int y = year != null ? year : now.getYear();
        int m = month != null ? month : now.getMonthValue();
        return Result.success(habitService.getHeatmapData(y, m));
    }

    @GetMapping("/ranking")
    public Result<List<RankingVO>> getRanking() {
        return Result.success(habitService.getRanking());
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        return Result.success(habitService.getTodayStats());
    }

    @PostMapping
    public Result<Habit> createHabit(@RequestBody Habit habit) {
        return Result.success(habitService.createHabit(habit));
    }

    @DeleteMapping("/{id}")
    public Result<?> deleteHabit(@PathVariable Long id) {
        habitService.deleteHabit(id);
        return Result.success();
    }
}
