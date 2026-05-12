package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.entity.PatientDiagnosis;
import com.tcm.system.service.PatientDiagnosisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/diagnosis")
public class PatientDiagnosisController {

    @Autowired
    private PatientDiagnosisService diagnosisService;

    @GetMapping("/patient/{patientId}")
    public Result<List<PatientDiagnosis>> listByPatient(@PathVariable Long patientId) {
        return Result.success(diagnosisService.listByPatient(patientId));
    }

    @GetMapping("/{id}")
    public Result<PatientDiagnosis> getById(@PathVariable Long id) {
        return Result.success(diagnosisService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody PatientDiagnosis diagnosis) {
        return Result.success(diagnosisService.save(diagnosis));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody PatientDiagnosis diagnosis) {
        return Result.success(diagnosisService.update(diagnosis));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(diagnosisService.delete(id));
    }
}
