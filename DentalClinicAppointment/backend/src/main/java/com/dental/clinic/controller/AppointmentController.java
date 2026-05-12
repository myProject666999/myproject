package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.Appointment;
import com.dental.clinic.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@CrossOrigin
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping
    public Result<PageResult<Appointment>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long clinicId,
            @RequestParam(required = false) String status) {
        Page<Appointment> page = appointmentService.page(current, size, patientId, doctorId, clinicId, status);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<Appointment>> listByPatientId(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentService.listByPatientId(patientId);
        return Result.success(appointments);
    }

    @GetMapping("/{id}")
    public Result<Appointment> getById(@PathVariable Long id) {
        Appointment appointment = appointmentService.getById(id);
        if (appointment == null) {
            return Result.error("预约不存在");
        }
        return Result.success(appointment);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Appointment appointment) {
        try {
            boolean result = appointmentService.save(appointment);
            return result ? Result.success(true) : Result.error("预约失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Appointment appointment) {
        boolean result = appointmentService.update(appointment);
        return result ? Result.success(true) : Result.error("更新失败");
    }

    @PutMapping("/{id}/cancel")
    public Result<Boolean> cancel(@PathVariable Long id) {
        boolean result = appointmentService.cancel(id);
        return result ? Result.success(true) : Result.error("取消失败");
    }
}
