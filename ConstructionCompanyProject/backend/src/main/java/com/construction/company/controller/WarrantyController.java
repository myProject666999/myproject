package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Warranty;
import com.construction.company.service.WarrantyService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "保修管理")
@RestController
@RequestMapping("/warranty")
public class WarrantyController {

    @Autowired
    private WarrantyService warrantyService;

    @ApiOperation("查询保修列表")
    @GetMapping("/list")
    public Result<List<Warranty>> list() {
        return Result.success(warrantyService.list());
    }

    @ApiOperation("根据ID查询保修")
    @GetMapping("/{id}")
    public Result<Warranty> getById(@PathVariable Long id) {
        return Result.success(warrantyService.getById(id));
    }

    @ApiOperation("新增保修")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Warranty warranty) {
        return Result.success(warrantyService.save(warranty));
    }

    @ApiOperation("更新保修")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Warranty warranty) {
        return Result.success(warrantyService.updateById(warranty));
    }

    @ApiOperation("删除保修")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(warrantyService.removeById(id));
    }
}
