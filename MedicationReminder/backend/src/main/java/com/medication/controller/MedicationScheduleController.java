package com.medication.controller;

import com.medication.common.Result;
import com.medication.entity.MedicationSchedule;
import com.medication.service.MedicationScheduleService;
import com.medication.vo.ScheduleVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/schedules")
public class MedicationScheduleController {

    @Autowired
    private MedicationScheduleService scheduleService;

    @GetMapping
    public Result<List<ScheduleVO>> list() {
        return Result.success(scheduleService.listAll());
    }

    @GetMapping("/user/{userId}")
    public Result<List<ScheduleVO>> listByUserId(@PathVariable Long userId) {
        return Result.success(scheduleService.listByUserId(userId));
    }

    @GetMapping("/today/{userId}")
    public Result<List<ScheduleVO>> listTodayByUserId(@PathVariable Long userId) {
        return Result.success(scheduleService.listTodayByUserId(userId));
    }

    @GetMapping("/{id}")
    public Result<MedicationSchedule> getById(@PathVariable Long id) {
        return Result.success(scheduleService.getById(id));
    }

    @PostMapping
    public Result<MedicationSchedule> save(@RequestBody MedicationSchedule schedule) {
        scheduleService.save(schedule);
        return Result.success(schedule);
    }

    @PutMapping
    public Result<MedicationSchedule> update(@RequestBody MedicationSchedule schedule) {
        scheduleService.updateById(schedule);
        return Result.success(schedule);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        scheduleService.removeById(id);
        return Result.success();
    }
}
