
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.Appointment;
import com.beautyhair.entity.Employee;
import com.beautyhair.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointment")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/page")
    public Result<PageResult<Appointment>> getAppointmentPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long technicianId) {
        PageResult<Appointment> result = appointmentService.getAppointmentPage(page, size, keyword, status, startDate, endDate, technicianId);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Appointment> getById(@PathVariable Long id) {
        Appointment appointment = appointmentService.getById(id);
        return Result.success(appointment);
    }

    @PostMapping
    public Result<Void> add(@RequestBody Appointment appointment) {
        appointmentService.add(appointment);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody Appointment appointment) {
        appointmentService.update(appointment);
        return Result.success("更新成功");
    }

    @PutMapping("/status/{id}/{status}")
    public Result<Void> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        appointmentService.updateStatus(id, status);
        return Result.success("状态更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return Result.success("删除成功");
    }

    @GetMapping("/schedule")
    public Result<List<Map<String, Object>>> getSchedule(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<Map<String, Object>> result = appointmentService.getAppointmentSchedule(startDate, endDate);
        return Result.success(result);
    }

    @GetMapping("/technicians")
    public Result<List<Employee>> getTechnicians() {
        List<Employee> technicians = appointmentService.getTechnicians();
        return Result.success(technicians);
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        return Result.success(appointmentService.getAppointmentStatistics());
    }
}
