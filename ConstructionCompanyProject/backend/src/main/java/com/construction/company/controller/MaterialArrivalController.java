package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.MaterialArrival;
import com.construction.company.service.MaterialArrivalService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "材料到货管理")
@RestController
@RequestMapping("/materialArrival")
public class MaterialArrivalController {

    @Autowired
    private MaterialArrivalService materialArrivalService;

    @ApiOperation("查询材料到货列表")
    @GetMapping("/list")
    public Result<List<MaterialArrival>> list() {
        return Result.success(materialArrivalService.list());
    }

    @ApiOperation("根据ID查询材料到货")
    @GetMapping("/{id}")
    public Result<MaterialArrival> getById(@PathVariable Long id) {
        return Result.success(materialArrivalService.getById(id));
    }

    @ApiOperation("新增材料到货")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody MaterialArrival materialArrival) {
        return Result.success(materialArrivalService.save(materialArrival));
    }

    @ApiOperation("更新材料到货")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody MaterialArrival materialArrival) {
        return Result.success(materialArrivalService.updateById(materialArrival));
    }

    @ApiOperation("删除材料到货")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(materialArrivalService.removeById(id));
    }
}
