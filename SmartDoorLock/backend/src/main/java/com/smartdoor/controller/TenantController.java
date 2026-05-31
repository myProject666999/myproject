package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.dto.TenantQueryDTO;
import com.smartdoor.entity.Tenant;
import com.smartdoor.service.TenantService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "租客管理")
@RestController
@RequestMapping("/tenant")
public class TenantController {

    @Autowired
    private TenantService tenantService;

    @ApiOperation("分页查询租客列表")
    @GetMapping("/page")
    public Result<PageResult<Tenant>> getTenantPage(TenantQueryDTO queryDTO) {
        return tenantService.getTenantPage(queryDTO);
    }

    @ApiOperation("获取租客详情")
    @GetMapping("/{id}")
    public Result<Tenant> getTenantDetail(@PathVariable Long id) {
        return tenantService.getTenantDetail(id);
    }

    @ApiOperation("获取所有租客列表")
    @GetMapping("/list")
    public Result<List<Tenant>> getTenantList() {
        return Result.success(tenantService.list());
    }

    @ApiOperation("新增租客")
    @PostMapping
    public Result<Void> addTenant(@RequestBody Tenant tenant) {
        return tenantService.addTenant(tenant);
    }

    @ApiOperation("更新租客")
    @PutMapping
    public Result<Void> updateTenant(@RequestBody Tenant tenant) {
        return tenantService.updateTenant(tenant);
    }

    @ApiOperation("删除租客")
    @DeleteMapping("/{id}")
    public Result<Void> deleteTenant(@PathVariable Long id) {
        return tenantService.deleteTenant(id);
    }
}
