package com.dental.clinic.controller;

import com.dental.clinic.common.Result;
import com.dental.clinic.entity.ToothStatus;
import com.dental.clinic.service.ToothStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tooth-status")
@CrossOrigin
public class ToothStatusController {

    @Autowired
    private ToothStatusService toothStatusService;

    @GetMapping("/patient/{patientId}")
    public Result<List<ToothStatus>> listByPatientId(@PathVariable Long patientId) {
        List<ToothStatus> toothStatuses = toothStatusService.listByPatientId(patientId);
        return Result.success(toothStatuses);
    }

    @GetMapping("/patient/{patientId}/tooth/{toothNumber}")
    public Result<ToothStatus> getByPatientAndTooth(
            @PathVariable Long patientId,
            @PathVariable Integer toothNumber) {
        ToothStatus toothStatus = toothStatusService.getByPatientAndTooth(patientId, toothNumber);
        return Result.success(toothStatus);
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody ToothStatus toothStatus) {
        boolean result = toothStatusService.save(toothStatus);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody ToothStatus toothStatus) {
        boolean result = toothStatusService.update(toothStatus);
        return result ? Result.success(true) : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = toothStatusService.delete(id);
        return result ? Result.success(true) : Result.error("删除失败");
    }
}
