package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.MaterialPurchase;
import com.construction.company.service.MaterialPurchaseService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "材料采购管理")
@RestController
@RequestMapping("/materialPurchase")
public class MaterialPurchaseController {

    @Autowired
    private MaterialPurchaseService materialPurchaseService;

    @ApiOperation("查询材料采购列表")
    @GetMapping("/list")
    public Result<List<MaterialPurchase>> list() {
        return Result.success(materialPurchaseService.list());
    }

    @ApiOperation("根据ID查询材料采购")
    @GetMapping("/{id}")
    public Result<MaterialPurchase> getById(@PathVariable Long id) {
        return Result.success(materialPurchaseService.getById(id));
    }

    @ApiOperation("新增材料采购")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody MaterialPurchase materialPurchase) {
        return Result.success(materialPurchaseService.save(materialPurchase));
    }

    @ApiOperation("更新材料采购")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody MaterialPurchase materialPurchase) {
        return Result.success(materialPurchaseService.updateById(materialPurchase));
    }

    @ApiOperation("删除材料采购")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(materialPurchaseService.removeById(id));
    }
}
