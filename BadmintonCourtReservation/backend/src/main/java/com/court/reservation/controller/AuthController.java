package com.court.reservation.controller;

import com.court.reservation.common.Result;
import com.court.reservation.entity.User;
import com.court.reservation.service.AuthService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Resource
    private AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        return Result.success(authService.login(username, password));
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        return Result.success(authService.register(user));
    }
}