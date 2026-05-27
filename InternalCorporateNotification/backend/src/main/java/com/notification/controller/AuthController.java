package com.notification.controller;

import com.notification.common.Result;
import com.notification.entity.User;
import com.notification.service.AuthService;
import com.notification.utils.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        return authService.login(username, password);
    }

    @PostMapping("/logout")
    public Result<?> logout() {
        Long userId = UserContext.getUserId();
        return authService.logout(userId);
    }

    @GetMapping("/user-info")
    public Result<User> getUserInfo() {
        Long userId = UserContext.getUserId();
        return authService.getUserInfo(userId);
    }
}
