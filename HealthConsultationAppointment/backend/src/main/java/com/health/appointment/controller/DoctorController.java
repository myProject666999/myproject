package com.health.appointment.controller;

import com.health.appointment.common.Result;
import com.health.appointment.entity.Doctor;
import com.health.appointment.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public Result<List<Doctor>> getDoctors(@RequestParam(required = false) Long departmentId) {
        List<Doctor> doctors;
        if (departmentId != null) {
            doctors = doctorService.getDoctorsByDepartment(departmentId);
        } else {
            doctors = doctorService.getAllDoctors();
        }
        return Result.success(doctors);
    }

    @GetMapping("/{id}")
    public Result<Doctor> getDoctorById(@PathVariable Long id) {
        Doctor doctor = doctorService.getDoctorById(id);
        if (doctor == null) {
            return Result.error("医生不存在");
        }
        return Result.success(doctor);
    }
}
