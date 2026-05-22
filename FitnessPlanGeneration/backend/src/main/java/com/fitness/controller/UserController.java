package com.fitness.controller;

import com.fitness.common.Result;
import com.fitness.dto.LoginDTO;
import com.fitness.dto.RegisterDTO;
import com.fitness.entity.User;
import com.fitness.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<User> login(@Valid @RequestBody LoginDTO dto) {
        try {
            User user = userService.login(dto);
            user.setPassword(null);
            return Result.success(user);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/register")
    public Result<User> register(@Valid @RequestBody RegisterDTO dto) {
        try {
            User user = userService.register(dto);
            user.setPassword(null);
            return Result.success(user);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }
}
