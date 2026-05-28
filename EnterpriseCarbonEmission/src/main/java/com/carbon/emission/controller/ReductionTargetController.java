package com.carbon.emission.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.carbon.emission.common.Result;
import com.carbon.emission.entity.ReductionTarget;
import com.carbon.emission.service.ReductionTargetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/reduction-target")
public class ReductionTargetController {

    @Autowired
    private ReductionTargetService reductionTargetService;

    @GetMapping("/page")
    public Result<Page<ReductionTarget>> getTargetPage(
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(reductionTargetService.getTargetPage(orgId, status, pageNum, pageSize));
    }

    @GetMapping("/org/{orgId}")
    public Result<List<ReductionTarget>> getTargetsByOrg(@PathVariable Long orgId) {
        return Result.success(reductionTargetService.getTargetsByOrg(orgId));
    }

    @GetMapping("/{id}")
    public Result<ReductionTarget> getById(@PathVariable Long id) {
        return Result.success(reductionTargetService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody ReductionTarget target) {
        return Result.success(reductionTargetService.save(target));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody ReductionTarget target) {
        return Result.success(reductionTargetService.updateById(target));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(reductionTargetService.removeById(id));
    }

    @PostMapping("/update-progress")
    public Result<ReductionTarget> updateTargetProgress(
            @RequestParam Long targetId,
            @RequestParam BigDecimal actualEmission) {
        return Result.success(reductionTargetService.updateTargetProgress(targetId, actualEmission));
    }
}
