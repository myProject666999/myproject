package com.oj.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.oj.common.Result;
import com.oj.dto.LoginDTO;
import com.oj.dto.RegisterDTO;
import com.oj.entity.User;
import com.oj.service.UserService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Resource
    private UserService userService;

    @PostMapping("/login")
    public Result<User> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(userService.login(loginDTO));
    }

    @PostMapping("/register")
    public Result<User> register(@Valid @RequestBody RegisterDTO registerDTO) {
        return Result.success(userService.register(registerDTO));
    }

    @GetMapping("/info")
    public Result<User> getUserInfo(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        return Result.success(userService.getUserInfo(userId));
    }

    @PutMapping("/update")
    public Result<String> updateUser(@RequestBody User user, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        user.setId(userId);
        userService.updateUser(user);
        return Result.success("更新成功");
    }

    @GetMapping("/detail/{id}")
    public Result<User> getUserDetail(@PathVariable Long id) {
        return Result.success(userService.getUserInfo(id));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<IPage<User>> getUserPage(@RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(required = false) String keyword) {
        return Result.success(userService.getUserPage(page, size, keyword));
    }

    @PutMapping("/status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.updateStatus(id, status);
        return Result.success("更新成功");
    }

    @PutMapping("/role/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> updateRole(@PathVariable Long id, @RequestParam Integer role) {
        userService.updateRole(id, role);
        return Result.success("更新成功");
    }
}
