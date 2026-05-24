package com.workorder.controller;

import com.workorder.common.Result;
import com.workorder.entity.User;
import com.workorder.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    @GetMapping("/agents")
    public Result<List<User>> getAgents() {
        return Result.success(userService.getAgents());
    }

    @GetMapping("/customers")
    public Result<List<User>> getCustomers() {
        return Result.success(userService.getCustomers());
    }

    @GetMapping
    public Result<List<User>> getAllUsers() {
        return Result.success(userService.getAllUsers());
    }
}