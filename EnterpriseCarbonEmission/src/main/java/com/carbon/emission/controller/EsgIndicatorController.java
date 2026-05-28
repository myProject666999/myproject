package com.carbon.emission.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.carbon.emission.common.Result;
import com.carbon.emission.entity.EsgIndicator;
import com.carbon.emission.entity.EsgIndicatorData;
import com.carbon.emission.service.EsgIndicatorDataService;
import com.carbon.emission.service.EsgIndicatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/esg-indicator")
public class EsgIndicatorController {

    @Autowired
    private EsgIndicatorService esgIndicatorService;

    @Autowired
    private EsgIndicatorDataService esgIndicatorDataService;

    @GetMapping("/list")
    public Result<List<EsgIndicator>> getAllIndicators() {
        return Result.success(esgIndicatorService.getAllIndicators());
    }

    @GetMapping("/dimension/{dimension}")
    public Result<List<EsgIndicator>> getIndicatorsByDimension(@PathVariable Integer dimension) {
        return Result.success(esgIndicatorService.getIndicatorsByDimension(dimension));
    }

    @GetMapping("/{id}")
    public Result<EsgIndicator> getIndicatorById(@PathVariable Long id) {
        return Result.success(esgIndicatorService.getById(id));
    }

    @PostMapping
    public Result<Boolean> saveIndicator(@RequestBody EsgIndicator indicator) {
        return Result.success(esgIndicatorService.save(indicator));
    }

    @PutMapping
    public Result<Boolean> updateIndicator(@RequestBody EsgIndicator indicator) {
        return Result.success(esgIndicatorService.updateById(indicator));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> deleteIndicator(@PathVariable Long id) {
        return Result.success(esgIndicatorService.removeById(id));
    }

    @GetMapping("/data/page")
    public Result<Page<EsgIndicatorData>> getIndicatorDataPage(
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) Long indicatorId,
            @RequestParam(required = false) Integer periodType,
            @RequestParam(required = false) String periodValue,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(esgIndicatorDataService.getDataPage(orgId, indicatorId, periodType, periodValue, pageNum, pageSize));
    }

    @PostMapping("/data")
    public Result<Boolean> saveIndicatorData(@RequestBody EsgIndicatorData data) {
        return Result.success(esgIndicatorDataService.save(data));
    }

    @PutMapping("/data")
    public Result<Boolean> updateIndicatorData(@RequestBody EsgIndicatorData data) {
        return Result.success(esgIndicatorDataService.updateById(data));
    }

    @DeleteMapping("/data/{id}")
    public Result<Boolean> deleteIndicatorData(@PathVariable Long id) {
        return Result.success(esgIndicatorDataService.removeById(id));
    }
}
