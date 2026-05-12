package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.entity.Patient;
import com.tcm.system.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    public Result<List<Patient>> list(@RequestParam(required = false) String keyword) {
        return Result.success(patientService.list(keyword));
    }

    @GetMapping("/{id}")
    public Result<Patient> getById(@PathVariable Long id) {
        return Result.success(patientService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Patient patient) {
        return Result.success(patientService.save(patient));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Patient patient) {
        return Result.success(patientService.update(patient));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(patientService.delete(id));
    }
}
