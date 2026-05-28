package com.carbon.emission.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.carbon.emission.common.Result;
import com.carbon.emission.entity.EmissionData;
import com.carbon.emission.entity.ImportBatch;
import com.carbon.emission.service.EmissionDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/emission-data")
public class EmissionDataController {

    @Autowired
    private EmissionDataService emissionDataService;

    @GetMapping("/page")
    public Result<Page<EmissionData>> getDataPage(
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) Integer emissionScope,
            @RequestParam(required = false) Integer sourceType,
            @RequestParam(required = false) String activityMonth,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(emissionDataService.getDataPage(orgId, emissionScope, sourceType, activityMonth, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<EmissionData> getById(@PathVariable Long id) {
        return Result.success(emissionDataService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody EmissionData data) {
        return Result.success(emissionDataService.saveEmissionData(data));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody EmissionData data) {
        return Result.success(emissionDataService.updateById(data));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(emissionDataService.removeById(id));
    }

    @PostMapping("/import")
    public Result<ImportBatch> batchImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long orgId,
            @RequestParam String createBy) throws IOException {
        return Result.success(emissionDataService.batchImport(file, orgId, createBy));
    }
}
