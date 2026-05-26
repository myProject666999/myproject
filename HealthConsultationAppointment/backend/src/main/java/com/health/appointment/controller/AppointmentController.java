package com.health.appointment.controller;

import com.health.appointment.common.Result;
import com.health.appointment.entity.Appointment;
import com.health.appointment.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/patient/{patientId}")
    public Result<List<Appointment>> getAppointmentsByPatient(@PathVariable Long patientId) {
        return Result.success(appointmentService.getAppointmentsByPatient(patientId));
    }

    @GetMapping("/{id}")
    public Result<Appointment> getAppointmentById(@PathVariable Long id) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        if (appointment == null) {
            return Result.error("预约记录不存在");
        }
        return Result.success(appointment);
    }

    @PostMapping
    public Result<Appointment> createAppointment(@RequestBody Map<String, Object> params) {
        try {
            Long scheduleId = Long.valueOf(params.get("scheduleId").toString());
            String patientPhone = params.get("patientPhone").toString();
            String patientName = params.get("patientName").toString();
            Appointment appointment = appointmentService.createAppointment(scheduleId, patientPhone, patientName);
            return Result.success(appointment);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public Result<Appointment> cancelAppointment(@PathVariable Long id, @RequestBody(required = false) Map<String, String> params) {
        try {
            String reason = params != null ? params.get("reason") : null;
            Appointment appointment = appointmentService.cancelAppointment(id, reason);
            return Result.success(appointment);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
