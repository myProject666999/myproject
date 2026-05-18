package com.example.resume.controller;

import com.example.resume.common.Result;
import com.example.resume.entity.Template;
import com.example.resume.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateService templateService;

    @GetMapping
    public Result<List<Template>> getAllActiveTemplates() {
        return Result.success(templateService.getAllActiveTemplates());
    }

    @GetMapping("/all")
    public Result<List<Template>> getAllTemplates() {
        return Result.success(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    public Result<Template> getTemplateById(@PathVariable Long id) {
        return templateService.getTemplateById(id)
                .map(Result::success)
                .orElse(Result.error("Template not found"));
    }

    @GetMapping("/code/{code}")
    public Result<Template> getTemplateByCode(@PathVariable String code) {
        return templateService.getTemplateByCode(code)
                .map(Result::success)
                .orElse(Result.error("Template not found"));
    }

    @PostMapping
    public Result<Template> createTemplate(@RequestBody Template template) {
        Template created = templateService.saveTemplate(template);
        return Result.success("Template created successfully", created);
    }

    @PutMapping("/{id}")
    public Result<Template> updateTemplate(@PathVariable Long id, @RequestBody Template template) {
        template.setId(id);
        Template updated = templateService.saveTemplate(template);
        return Result.success("Template updated successfully", updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return Result.success("Template deleted successfully", null);
    }
}
