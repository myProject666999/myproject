package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.dto.ConflictCheckResult;
import com.tcm.system.dto.PrescriptionDTO;
import com.tcm.system.entity.Prescription;
import com.tcm.system.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @GetMapping("/check-conflict")
    public Result<ConflictCheckResult> checkConflict(@RequestParam(required = false) List<Long> herbIds,
                                                     @RequestParam(required = false) List<String> herbNames) {
        return Result.success(prescriptionService.checkConflicts(herbIds, herbNames));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<Prescription>> listByPatient(@PathVariable Long patientId) {
        return Result.success(prescriptionService.listByPatient(patientId));
    }

    @GetMapping("/{id}")
    public Result<PrescriptionDTO> getDetail(@PathVariable Long id) {
        return Result.success(prescriptionService.getDetail(id));
    }

    @PostMapping
    public Result<Boolean> create(@RequestBody PrescriptionDTO dto) {
        return Result.success(prescriptionService.createPrescription(dto));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody PrescriptionDTO dto) {
        return Result.success(prescriptionService.updatePrescription(dto));
    }

    @PutMapping("/{id}/status/{status}")
    public Result<Boolean> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        return Result.success(prescriptionService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(prescriptionService.delete(id));
    }
}
