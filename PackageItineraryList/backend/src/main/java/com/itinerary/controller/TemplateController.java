package com.itinerary.controller;

import com.itinerary.common.Result;
import com.itinerary.entity.Template;
import com.itinerary.entity.TemplateItem;
import com.itinerary.service.TemplateService;
import com.itinerary.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/template")
@CrossOrigin
public class TemplateController {

    @Autowired
    private TemplateService templateService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/public")
    public Result<List<Template>> getPublicTemplates() {
        return Result.success(templateService.getPublicTemplates());
    }

    @GetMapping("/my")
    public Result<List<Template>> getUserTemplates(@RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        return Result.success(templateService.getUserTemplates(userId));
    }

    @GetMapping("/{id}/items")
    public Result<List<TemplateItem>> getTemplateItems(@PathVariable Long id) {
        return Result.success(templateService.getTemplateItems(id));
    }

    @PostMapping
    public Result<Template> createTemplate(@RequestBody Template template,
                                           @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        return Result.success(templateService.createTemplate(template, userId));
    }

    @PostMapping("/{parentId}/inherit")
    public Result<Template> inheritTemplate(@PathVariable Long parentId,
                                            @RequestBody Template template,
                                            @RequestHeader("Authorization") String token) {
        Long userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        return Result.success(templateService.inheritTemplate(parentId, template, userId));
    }
}
