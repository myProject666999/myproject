package com.health.appointment.controller;

import com.health.appointment.common.Result;
import com.health.appointment.entity.Schedule;
import com.health.appointment.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/schedules")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping
    public Result<List<Schedule>> getSchedules(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<Schedule> schedules;
        if (doctorId != null) {
            schedules = scheduleService.getSchedulesByDoctor(doctorId, startDate, endDate);
        } else if (departmentId != null) {
            schedules = scheduleService.getSchedulesByDepartment(departmentId, startDate, endDate);
        } else {
            return Result.error("请选择科室或医生");
        }
        return Result.success(schedules);
    }

    @GetMapping("/{id}")
    public Result<Schedule> getScheduleById(@PathVariable Long id) {
        Schedule schedule = scheduleService.getScheduleById(id);
        if (schedule == null) {
            return Result.error("排班不存在");
        }
        return Result.success(schedule);
    }
}
