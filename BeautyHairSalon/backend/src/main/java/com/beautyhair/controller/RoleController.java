
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.SysRole;
import com.beautyhair.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/role")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping("/page")
    public Result<PageResult<SysRole>> getRolePage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) Integer status) {
        PageResult<SysRole> result = roleService.getRolePage(page, size, roleName, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<SysRole> getById(@PathVariable Long id) {
        SysRole role = roleService.getById(id);
        return Result.success(role);
    }

    @GetMapping("/all")
    public Result<List<SysRole>> getAll() {
        List<SysRole> roles = roleService.getAll();
        return Result.success(roles);
    }

    @PostMapping
    public Result<Void> add(@RequestBody SysRole role) {
        roleService.add(role);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody SysRole role) {
        roleService.update(role);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return Result.success("删除成功");
    }
}
