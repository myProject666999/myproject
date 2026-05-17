package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Material;
import com.construction.company.service.MaterialService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "材料管理")
@RestController
@RequestMapping("/material")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @ApiOperation("查询材料列表")
    @GetMapping("/list")
    public Result<List<Material>> list() {
        return Result.success(materialService.list());
    }

    @ApiOperation("根据ID查询材料")
    @GetMapping("/{id}")
    public Result<Material> getById(@PathVariable Long id) {
        return Result.success(materialService.getById(id));
    }

    @ApiOperation("新增材料")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Material material) {
        return Result.success(materialService.save(material));
    }

    @ApiOperation("更新材料")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Material material) {
        return Result.success(materialService.updateById(material));
    }

    @ApiOperation("删除材料")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(materialService.removeById(id));
    }
}
