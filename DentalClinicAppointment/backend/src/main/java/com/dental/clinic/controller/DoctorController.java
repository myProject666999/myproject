package com.dental.clinic.controller;

import com.dental.clinic.common.Result;
import com.dental.clinic.entity.Doctor;
import com.dental.clinic.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@CrossOrigin
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public Result<List<Doctor>> list(@RequestParam(required = false) Long clinicId) {
        List<Doctor> doctors = doctorService.list(clinicId);
        return Result.success(doctors);
    }

    @GetMapping("/{id}")
    public Result<Doctor> getById(@PathVariable Long id) {
        Doctor doctor = doctorService.getById(id);
        if (doctor == null) {
            return Result.error("医生不存在");
        }
        return Result.success(doctor);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Doctor doctor) {
        boolean result = doctorService.save(doctor);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Doctor doctor) {
        boolean result = doctorService.update(doctor);
        return result ? Result.success(true) : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = doctorService.delete(id);
        return result ? Result.success(true) : Result.error("删除失败");
    }
}
