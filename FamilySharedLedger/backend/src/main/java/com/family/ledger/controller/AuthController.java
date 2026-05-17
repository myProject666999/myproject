package com.family.ledger.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.family.ledger.common.Result;
import com.family.ledger.entity.User;
import com.family.ledger.mapper.UserMapper;
import com.family.ledger.util.JwtUtil;
import com.family.ledger.util.PasswordUtil;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordUtil passwordUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest request) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", request.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            return Result.error("用户不存在");
        }

        if (!passwordUtil.matches(request.getPassword(), user.getPassword())) {
            return Result.error("密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);
        return Result.success(data);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody RegisterRequest request) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", request.getUsername());
        if (userMapper.selectOne(wrapper) != null) {
            return Result.error("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordUtil.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setEmail(request.getEmail());
        user.setStatus(1);
        userMapper.insert(user);
        return Result.success(user);
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private String nickname;
        private String email;
    }
}
