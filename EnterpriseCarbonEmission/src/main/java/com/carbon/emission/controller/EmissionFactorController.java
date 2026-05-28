package com.carbon.emission.controller;

import com.carbon.emission.common.Result;
import com.carbon.emission.entity.EmissionFactor;
import com.carbon.emission.service.EmissionFactorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emission-factor")
public class EmissionFactorController {

    @Autowired
    private EmissionFactorService emissionFactorService;

    @GetMapping("/current")
    public Result<List<EmissionFactor>> getCurrentVersionFactors() {
        return Result.success(emissionFactorService.getCurrentVersionFactors());
    }

    @GetMapping("/type/{factorType}")
    public Result<List<EmissionFactor>> getFactorsByType(@PathVariable Integer factorType) {
        return Result.success(emissionFactorService.getFactorsByType(factorType));
    }

    @GetMapping("/{id}")
    public Result<EmissionFactor> getById(@PathVariable Long id) {
        return Result.success(emissionFactorService.getById(id));
    }

    @GetMapping("/code/{factorCode}/version/{version}")
    public Result<EmissionFactor> getFactorByCodeAndVersion(@PathVariable String factorCode, @PathVariable String version) {
        return Result.success(emissionFactorService.getFactorByCodeAndVersion(factorCode, version));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody EmissionFactor factor) {
        return Result.success(emissionFactorService.save(factor));
    }

    @PostMapping("/version")
    public Result<Boolean> addNewVersion(@RequestBody EmissionFactor factor) {
        return Result.success(emissionFactorService.addNewVersion(factor));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody EmissionFactor factor) {
        return Result.success(emissionFactorService.updateById(factor));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(emissionFactorService.removeById(id));
    }
}
