package com.carbon.emission.controller;

import com.carbon.emission.common.Result;
import com.carbon.emission.entity.EmissionCalculation;
import com.carbon.emission.service.EmissionCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/emission-calculation")
public class EmissionCalculationController {

    @Autowired
    private EmissionCalculationService emissionCalculationService;

    @PostMapping("/calculate")
    public Result<Map<String, Object>> calculateEmission(
            @RequestParam Long orgId,
            @RequestParam Integer periodType,
            @RequestParam String periodValue) {
        return Result.success(emissionCalculationService.calculateEmission(orgId, periodType, periodValue));
    }

    @GetMapping("/results")
    public Result<List<EmissionCalculation>> getCalculationResults(
            @RequestParam Long orgId,
            @RequestParam Integer periodType,
            @RequestParam String periodValue) {
        return Result.success(emissionCalculationService.getCalculationResults(orgId, periodType, periodValue));
    }

    @GetMapping("/{id}")
    public Result<EmissionCalculation> getById(@PathVariable Long id) {
        return Result.success(emissionCalculationService.getById(id));
    }
}
