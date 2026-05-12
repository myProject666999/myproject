package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.Schedule;
import com.dental.clinic.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedules")
@CrossOrigin
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping
    public Result<PageResult<Schedule>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long clinicId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        Page<Schedule> page = scheduleService.page(current, size, doctorId, clinicId, startDate, endDate);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    public Result<List<Schedule>> listByDoctorAndDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        List<Schedule> schedules = scheduleService.listByDoctorAndDate(doctorId, date);
        return Result.success(schedules);
    }

    @GetMapping("/{id}")
    public Result<Schedule> getById(@PathVariable Long id) {
        Schedule schedule = scheduleService.getById(id);
        if (schedule == null) {
            return Result.error("排班不存在");
        }
        return Result.success(schedule);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Schedule schedule) {
        boolean result = scheduleService.save(schedule);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Schedule schedule) {
        boolean result = scheduleService.update(schedule);
        return result ? Result.success(true) : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = scheduleService.delete(id);
        return result ? Result.success(true) : Result.error("删除失败");
    }
}
