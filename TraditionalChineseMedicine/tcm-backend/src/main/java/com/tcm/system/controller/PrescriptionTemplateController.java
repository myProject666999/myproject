package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.entity.PrescriptionTemplate;
import com.tcm.system.entity.PrescriptionTemplateHerb;
import com.tcm.system.service.PrescriptionTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/templates")
public class PrescriptionTemplateController {

    @Autowired
    private PrescriptionTemplateService templateService;

    @GetMapping
    public Result<List<PrescriptionTemplate>> list(@RequestParam(required = false) String keyword,
                                                   @RequestParam(required = false) String category,
                                                   @RequestParam(required = false) Boolean isClassic) {
        return Result.success(templateService.list(keyword, category, isClassic));
    }

    @GetMapping("/{id}")
    public Result<PrescriptionTemplate> getById(@PathVariable Long id) {
        return Result.success(templateService.getById(id));
    }

    @GetMapping("/{id}/herbs")
    public Result<List<PrescriptionTemplateHerb>> getHerbs(@PathVariable Long id) {
        return Result.success(templateService.getHerbsByTemplateId(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody TemplateSaveRequest request) {
        return Result.success(templateService.save(request.getTemplate(), request.getHerbs()));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody TemplateSaveRequest request) {
        return Result.success(templateService.update(request.getTemplate(), request.getHerbs()));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(templateService.delete(id));
    }

    @lombok.Data
    public static class TemplateSaveRequest {
        private PrescriptionTemplate template;
        private List<PrescriptionTemplateHerb> herbs;
    }
}
