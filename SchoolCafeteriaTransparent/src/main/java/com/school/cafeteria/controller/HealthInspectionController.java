package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.HealthInspection;
import com.school.cafeteria.entity.Rectification;
import com.school.cafeteria.service.HealthInspectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/inspection")
public class HealthInspectionController {

    @Autowired
    private HealthInspectionService healthInspectionService;

    @GetMapping("/public/list")
    public Result<List<HealthInspection>> getAll() {
        List<HealthInspection> list = healthInspectionService.findAll();
        return Result.success(list);
    }

    @GetMapping("/public/{id}")
    public Result<HealthInspection> getById(@PathVariable Long id) {
        Optional<HealthInspection> inspection = healthInspectionService.findById(id);
        return inspection.map(Result::success).orElse(Result.error("记录不存在"));
    }

    @GetMapping("/public/range")
    public Result<List<HealthInspection>> getByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<HealthInspection> list = healthInspectionService.findByDateRange(startDate, endDate);
        return Result.success(list);
    }

    @GetMapping("/public/status/{status}")
    public Result<List<HealthInspection>> getByStatus(@PathVariable String status) {
        List<HealthInspection> list = healthInspectionService.findByRectifyStatus(status);
        return Result.success(list);
    }

    @GetMapping("/public/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = healthInspectionService.getInspectionStatistics();
        return Result.success(stats);
    }

    @PostMapping
    public Result<HealthInspection> create(@RequestBody HealthInspection inspection) {
        HealthInspection saved = healthInspectionService.save(inspection);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<HealthInspection> update(@PathVariable Long id, @RequestBody HealthInspection inspection) {
        Optional<HealthInspection> existing = healthInspectionService.findById(id);
        if (existing.isEmpty()) {
            return Result.error("记录不存在");
        }
        inspection.setId(id);
        HealthInspection saved = healthInspectionService.save(inspection);
        return Result.success("更新成功", saved);
    }

    @PostMapping("/rectification")
    public Result<Rectification> submitRectification(@RequestBody Rectification rectification) {
        Rectification saved = healthInspectionService.submitRectification(rectification);
        return Result.success("整改已提交", saved);
    }

    @PostMapping("/rectification/{inspectionId}/complete")
    public Result<Rectification> completeRectification(
            @PathVariable Long inspectionId,
            @RequestParam String rectifyDescription,
            @RequestParam(required = false) String rectifyImages) {
        Rectification updated = healthInspectionService.completeRectification(inspectionId, rectifyDescription, rectifyImages);
        if (updated == null) {
            return Result.error("记录不存在");
        }
        return Result.success("整改已完成", updated);
    }

    @PostMapping("/rectification/{inspectionId}/verify")
    public Result<Rectification> verifyRectification(
            @PathVariable Long inspectionId,
            @RequestParam String verifyPerson,
            @RequestParam String verifyResult,
            @RequestParam(required = false) String verifyComment) {
        Rectification updated = healthInspectionService.verifyRectification(inspectionId, verifyPerson, verifyResult, verifyComment);
        if (updated == null) {
            return Result.error("记录不存在");
        }
        return Result.success("复核完成", updated);
    }

    @GetMapping("/{inspectionId}/rectification")
    public Result<Rectification> getRectification(@PathVariable Long inspectionId) {
        Optional<Rectification> rectification = healthInspectionService.findRectificationByInspectionId(inspectionId);
        return rectification.map(Result::success).orElse(Result.error("整改记录不存在"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        healthInspectionService.delete(id);
        return Result.success();
    }
}
