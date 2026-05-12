package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.Patient;
import com.dental.clinic.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@CrossOrigin
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    public Result<PageResult<Patient>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Long clinicId) {
        Page<Patient> page = patientService.page(current, size, name, phone, clinicId);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/{id}")
    public Result<Patient> getById(@PathVariable Long id) {
        Patient patient = patientService.getById(id);
        if (patient == null) {
            return Result.error("患者不存在");
        }
        return Result.success(patient);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Patient patient) {
        boolean result = patientService.save(patient);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Patient patient) {
        boolean result = patientService.update(patient);
        return result ? Result.success(true) : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = patientService.delete(id);
        return result ? Result.success(true) : Result.error("删除失败");
    }
}
