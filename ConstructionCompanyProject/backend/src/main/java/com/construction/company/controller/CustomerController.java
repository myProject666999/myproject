package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Customer;
import com.construction.company.service.CustomerService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "客户管理")
@RestController
@RequestMapping("/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @ApiOperation("查询客户列表")
    @GetMapping("/list")
    public Result<List<Customer>> list() {
        return Result.success(customerService.list());
    }

    @ApiOperation("根据ID查询客户")
    @GetMapping("/{id}")
    public Result<Customer> getById(@PathVariable Long id) {
        return Result.success(customerService.getById(id));
    }

    @ApiOperation("新增客户")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Customer customer) {
        return Result.success(customerService.save(customer));
    }

    @ApiOperation("更新客户")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Customer customer) {
        return Result.success(customerService.updateById(customer));
    }

    @ApiOperation("删除客户")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(customerService.removeById(id));
    }
}
