package com.project.cost.controller;

import com.project.cost.common.Result;
import com.project.cost.entity.User;
import com.project.cost.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<User> login(@RequestBody Map<String, String> params) {
        try {
            String username = params.get("username");
            String password = params.get("password");
            return Result.success(userService.login(username, password));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/create")
    public Result<User> create(@RequestBody User user) {
        return Result.success(userService.createUser(user));
    }

    @PutMapping("/update")
    public Result<User> update(@RequestBody User user) {
        return Result.success(userService.updateUser(user));
    }

    @GetMapping("/list")
    public Result<List<User>> getAllUsers() {
        return Result.success(userService.getAllUsers());
    }

    @GetMapping("/dept/{deptId}")
    public Result<List<User>> getUsersByDept(@PathVariable Long deptId) {
        return Result.success(userService.getUsersByDept(deptId));
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }
}
