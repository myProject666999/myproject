package com.health.physical.controller;

import com.health.physical.common.Result;
import com.health.physical.entity.AbnormalRule;
import com.health.physical.entity.IndicatorCategory;
import com.health.physical.service.AbnormalRuleService;
import com.health.physical.service.IndicatorCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rule")
public class AbnormalRuleController {

    @Autowired
    private AbnormalRuleService abnormalRuleService;

    @Autowired
    private IndicatorCategoryService indicatorCategoryService;

    @GetMapping("/list")
    public Result<List<AbnormalRule>> getRuleList() {
        return Result.success(abnormalRuleService.getActiveRules());
    }

    @GetMapping("/all")
    public Result<List<AbnormalRule>> getAllRules() {
        return Result.success(abnormalRuleService.list());
    }

    @PostMapping("/add")
    public Result<Boolean> addRule(@RequestBody AbnormalRule rule) {
        return Result.success(abnormalRuleService.save(rule));
    }

    @PutMapping("/update")
    public Result<Boolean> updateRule(@RequestBody AbnormalRule rule) {
        return Result.success(abnormalRuleService.updateById(rule));
    }

    @DeleteMapping("/delete/{id}")
    public Result<Boolean> deleteRule(@PathVariable Long id) {
        return Result.success(abnormalRuleService.removeById(id));
    }

    @GetMapping("/categories")
    public Result<List<IndicatorCategory>> getCategories() {
        return Result.success(indicatorCategoryService.getAllCategories());
    }
}
