package com.bmi.tracking.controller;

import com.bmi.tracking.common.Result;
import com.bmi.tracking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        return Result.success(userService.login(username, password));
    }

    @PostMapping("/register")
    public Result<Void> register(@RequestBody Map<String, String> body) {
        userService.register(body.get("username"), body.get("password"), body.get("nickname"));
        return Result.success();
    }
}
