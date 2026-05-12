package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.TreatmentRecord;
import com.dental.clinic.service.TreatmentRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/treatment-records")
@CrossOrigin
public class TreatmentRecordController {

    @Autowired
    private TreatmentRecordService treatmentRecordService;

    @GetMapping
    public Result<PageResult<TreatmentRecord>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String paymentStatus) {
        Page<TreatmentRecord> page = treatmentRecordService.page(current, size, patientId, doctorId, paymentStatus);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<TreatmentRecord>> listByPatientId(@PathVariable Long patientId) {
        List<TreatmentRecord> records = treatmentRecordService.listByPatientId(patientId);
        return Result.success(records);
    }

    @GetMapping("/{id}")
    public Result<TreatmentRecord> getById(@PathVariable Long id) {
        TreatmentRecord record = treatmentRecordService.getById(id);
        if (record == null) {
            return Result.error("治疗记录不存在");
        }
        return Result.success(record);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody TreatmentRecord record) {
        boolean result = treatmentRecordService.save(record);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody TreatmentRecord record) {
        boolean result = treatmentRecordService.update(record);
        return result ? Result.success(true) : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = treatmentRecordService.delete(id);
        return result ? Result.success(true) : Result.error("删除失败");
    }
}
