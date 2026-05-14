package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.User;
import com.fishing.reservation.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody User loginUser) {
        User user = userMapper.selectOne(
            new LambdaQueryWrapper<User>()
                .eq(User::getUsername, loginUser.getUsername())
        );

        if (user == null) {
            return Result.error("用户不存在");
        }

        if (!loginUser.getPassword().equals(user.getPassword())) {
            return Result.error("密码错误");
        }

        if (user.getStatus() != 1) {
            return Result.error("账户已禁用");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("token", "mock-token-" + user.getId());
        result.put("user", user);

        return Result.success("登录成功", result);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        User existUser = userMapper.selectOne(
            new LambdaQueryWrapper<User>().eq(User::getUsername, user.getUsername())
        );

        if (existUser != null) {
            return Result.error("用户名已存在");
        }

        user.setRole("USER");
        user.setStatus(1);
        userMapper.insert(user);

        return Result.success("注册成功", user);
    }
}
