
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.SysPermission;
import com.beautyhair.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permission")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping("/page")
    public Result<PageResult<SysPermission>> getPermissionPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String permissionName,
            @RequestParam(required = false) Integer status) {
        PageResult<SysPermission> result = permissionService.getPermissionPage(page, size, permissionName, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<SysPermission> getById(@PathVariable Long id) {
        SysPermission permission = permissionService.getById(id);
        return Result.success(permission);
    }

    @GetMapping("/all")
    public Result<List<SysPermission>> getAll() {
        List<SysPermission> permissions = permissionService.getAll();
        return Result.success(permissions);
    }

    @PostMapping
    public Result<Void> add(@RequestBody SysPermission permission) {
        permissionService.add(permission);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody SysPermission permission) {
        permissionService.update(permission);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return Result.success("删除成功");
    }
}
