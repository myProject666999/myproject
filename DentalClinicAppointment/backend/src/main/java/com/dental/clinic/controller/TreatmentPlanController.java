package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.TreatmentPlan;
import com.dental.clinic.service.TreatmentPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/treatment-plans")
@CrossOrigin
public class TreatmentPlanController {

    @Autowired
    private TreatmentPlanService treatmentPlanService;

    @GetMapping
    public Result<PageResult<TreatmentPlan>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String status) {
        Page<TreatmentPlan> page = treatmentPlanService.page(current, size, patientId, doctorId, status);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<TreatmentPlan>> listByPatientId(@PathVariable Long patientId) {
        List<TreatmentPlan> plans = treatmentPlanService.listByPatientId(patientId);
        return Result.success(plans);
    }

    @GetMapping("/{id}")
    public Result<TreatmentPlan> getById(@PathVariable Long id) {
        TreatmentPlan plan = treatmentPlanService.getById(id);
        if (plan == null) {
            return Result.error("治疗计划不存在");
        }
        return Result.success(plan);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody TreatmentPlan plan) {
        boolean result = treatmentPlanService.save(plan);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody TreatmentPlan plan) {
        boolean result = treatmentPlanService.update(plan);
        return result ? Result.success(true) : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = treatmentPlanService.delete(id);
        return result ? Result.success(true) : Result.error("删除失败");
    }
}
