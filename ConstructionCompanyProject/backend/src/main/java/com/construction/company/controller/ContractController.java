package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Contract;
import com.construction.company.service.ContractService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "合同管理")
@RestController
@RequestMapping("/contract")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @ApiOperation("查询合同列表")
    @GetMapping("/list")
    public Result<List<Contract>> list() {
        return Result.success(contractService.list());
    }

    @ApiOperation("根据ID查询合同")
    @GetMapping("/{id}")
    public Result<Contract> getById(@PathVariable Long id) {
        return Result.success(contractService.getById(id));
    }

    @ApiOperation("新增合同")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Contract contract) {
        return Result.success(contractService.save(contract));
    }

    @ApiOperation("更新合同")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Contract contract) {
        return Result.success(contractService.updateById(contract));
    }

    @ApiOperation("删除合同")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(contractService.removeById(id));
    }
}
