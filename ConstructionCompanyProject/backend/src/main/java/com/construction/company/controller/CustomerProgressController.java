package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.CustomerProgress;
import com.construction.company.service.CustomerProgressService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "客户进度管理")
@RestController
@RequestMapping("/customerProgress")
public class CustomerProgressController {

    @Autowired
    private CustomerProgressService customerProgressService;

    @ApiOperation("查询客户进度列表")
    @GetMapping("/list")
    public Result<List<CustomerProgress>> list() {
        return Result.success(customerProgressService.list());
    }

    @ApiOperation("根据ID查询客户进度")
    @GetMapping("/{id}")
    public Result<CustomerProgress> getById(@PathVariable Long id) {
        return Result.success(customerProgressService.getById(id));
    }

    @ApiOperation("新增客户进度")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody CustomerProgress customerProgress) {
        return Result.success(customerProgressService.save(customerProgress));
    }

    @ApiOperation("更新客户进度")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody CustomerProgress customerProgress) {
        return Result.success(customerProgressService.updateById(customerProgress));
    }

    @ApiOperation("删除客户进度")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(customerProgressService.removeById(id));
    }
}
