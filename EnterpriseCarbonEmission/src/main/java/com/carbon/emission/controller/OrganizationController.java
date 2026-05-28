package com.carbon.emission.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.carbon.emission.common.Result;
import com.carbon.emission.entity.Organization;
import com.carbon.emission.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organization")
public class OrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @GetMapping("/tree")
    public Result<List<Organization>> getOrganizationTree() {
        return Result.success(organizationService.getOrganizationTree());
    }

    @GetMapping("/list")
    public Result<List<Organization>> list() {
        return Result.success(organizationService.list());
    }

    @GetMapping("/{id}")
    public Result<Organization> getById(@PathVariable Long id) {
        return Result.success(organizationService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Organization organization) {
        return Result.success(organizationService.save(organization));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Organization organization) {
        return Result.success(organizationService.updateById(organization));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(organizationService.removeById(id));
    }

    @GetMapping("/children/{parentId}")
    public Result<List<Organization>> getChildOrganizations(@PathVariable Long parentId) {
        return Result.success(organizationService.getChildOrganizations(parentId));
    }
}
