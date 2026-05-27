package com.training.controller;

import com.training.common.Result;
import com.training.entity.Admin;
import com.training.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/{id}")
    public Result<Admin> getById(@PathVariable Long id) {
        return adminService.getById(id);
    }

    @GetMapping
    public Result<List<Admin>> list(@RequestParam(required = false) String name,
                                    @RequestParam(required = false) Integer status) {
        return adminService.list(name, status);
    }

    @PostMapping
    public Result<Admin> save(@RequestBody Admin admin) {
        return adminService.add(admin);
    }

    @PutMapping
    public Result<Admin> update(@RequestBody Admin admin) {
        return adminService.update(admin);
    }

    @PostMapping("/login")
    public Result<Admin> login(@RequestBody Admin admin) {
        return adminService.login(admin.getUsername(), admin.getPassword());
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        return adminService.delete(id);
    }
}
