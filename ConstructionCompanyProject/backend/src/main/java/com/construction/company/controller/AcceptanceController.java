package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Acceptance;
import com.construction.company.service.AcceptanceService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "验收管理")
@RestController
@RequestMapping("/acceptance")
public class AcceptanceController {

    @Autowired
    private AcceptanceService acceptanceService;

    @ApiOperation("查询验收列表")
    @GetMapping("/list")
    public Result<List<Acceptance>> list() {
        return Result.success(acceptanceService.list());
    }

    @ApiOperation("根据ID查询验收")
    @GetMapping("/{id}")
    public Result<Acceptance> getById(@PathVariable Long id) {
        return Result.success(acceptanceService.getById(id));
    }

    @ApiOperation("新增验收")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Acceptance acceptance) {
        return Result.success(acceptanceService.save(acceptance));
    }

    @ApiOperation("更新验收")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Acceptance acceptance) {
        return Result.success(acceptanceService.updateById(acceptance));
    }

    @ApiOperation("删除验收")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(acceptanceService.removeById(id));
    }
}
