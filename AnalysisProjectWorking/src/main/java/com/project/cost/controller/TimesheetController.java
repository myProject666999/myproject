package com.project.cost.controller;

import com.project.cost.common.Result;
import com.project.cost.entity.Timesheet;
import com.project.cost.service.TimesheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/timesheet")
@CrossOrigin
public class TimesheetController {

    @Autowired
    private TimesheetService timesheetService;

    @PostMapping("/create")
    public Result<Timesheet> create(@RequestBody Timesheet timesheet) {
        try {
            return Result.success(timesheetService.createTimesheet(timesheet));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/update")
    public Result<Timesheet> update(@RequestBody Timesheet timesheet) {
        try {
            return Result.success(timesheetService.updateTimesheet(timesheet));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/submit/{id}")
    public Result<Void> submit(@PathVariable Long id) {
        try {
            timesheetService.submitTimesheet(id);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/approve/{id}")
    public Result<Void> approve(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        try {
            Long approverId = Long.valueOf(params.get("approverId").toString());
            String comment = (String) params.get("comment");
            timesheetService.approveTimesheet(id, approverId, comment);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/reject/{id}")
    public Result<Void> reject(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        try {
            Long approverId = Long.valueOf(params.get("approverId").toString());
            String reason = (String) params.get("reason");
            timesheetService.rejectTimesheet(id, approverId, reason);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/my")
    public Result<List<Timesheet>> getMyTimesheets(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(timesheetService.getMyTimesheets(userId, startDate, endDate));
    }

    @GetMapping("/pending/{approverId}")
    public Result<List<Timesheet>> getPendingApprovals(@PathVariable Long approverId) {
        return Result.success(timesheetService.getPendingApprovals(approverId));
    }

    @GetMapping("/{id}")
    public Result<Timesheet> getById(@PathVariable Long id) {
        return Result.success(timesheetService.getById(id));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        timesheetService.removeById(id);
        return Result.success();
    }
}
