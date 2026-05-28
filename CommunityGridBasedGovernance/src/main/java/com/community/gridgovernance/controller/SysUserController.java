package com.community.gridgovernance.controller;

import com.community.gridgovernance.common.Result;
import com.community.gridgovernance.entity.SysUser;
import com.community.gridgovernance.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class SysUserController {

    @Autowired
    private SysUserService sysUserService;

    @GetMapping("/list")
    public Result<List<SysUser>> getAllUsers() {
        List<SysUser> users = sysUserService.getAllUsers();
        users.forEach(u -> u.setPassword(null));
        return Result.success(users);
    }

    @GetMapping("/{id}")
    public Result<SysUser> getUserById(@PathVariable Long id) {
        SysUser user = sysUserService.getById(id);
        user.setPassword(null);
        return Result.success(user);
    }

    @GetMapping("/workers")
    public Result<List<SysUser>> getAllGridWorkers() {
        List<SysUser> workers = sysUserService.getAllGridWorkers();
        workers.forEach(u -> u.setPassword(null));
        return Result.success(workers);
    }

    @GetMapping("/grid/{gridId}/workers")
    public Result<List<SysUser>> getGridWorkers(@PathVariable Long gridId) {
        List<SysUser> workers = sysUserService.getGridWorkersByGridId(gridId);
        workers.forEach(u -> u.setPassword(null));
        return Result.success(workers);
    }
}
