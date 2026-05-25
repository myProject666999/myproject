package com.corporate.reimbursement.controller;

import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.entity.SysUser;
import com.corporate.reimbursement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");
        SysUser user = userService.login(username, password);
        if (user == null) {
            return Result.error("用户名或密码错误");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("token", "mock-token-" + user.getId());
        data.put("user", user);
        return Result.success("登录成功", data);
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success("退出成功", null);
    }

    @GetMapping("/userinfo")
    public Result<SysUser> userinfo(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        Long userId = userIdStr != null ? Long.parseLong(userIdStr) : 1L;
        SysUser user = userService.getUserInfo(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(user);
    }
}