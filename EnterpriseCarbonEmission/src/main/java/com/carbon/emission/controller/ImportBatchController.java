package com.carbon.emission.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.carbon.emission.common.Result;
import com.carbon.emission.entity.ImportBatch;
import com.carbon.emission.service.ImportBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/import-batch")
public class ImportBatchController {

    @Autowired
    private ImportBatchService importBatchService;

    @GetMapping("/page")
    public Result<Page<ImportBatch>> getBatchPage(
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) Integer importType,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(importBatchService.page(new Page<>(pageNum, pageSize)));
    }

    @GetMapping("/{id}")
    public Result<ImportBatch> getById(@PathVariable Long id) {
        return Result.success(importBatchService.getById(id));
    }
}
