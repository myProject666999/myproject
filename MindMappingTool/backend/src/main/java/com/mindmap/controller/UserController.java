package com.mindmap.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.mindmap.common.Result;
import com.mindmap.entity.User;
import com.mindmap.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/login")
    public Result<User> login(@RequestBody User user) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, user.getUsername())
                .eq(User::getPassword, user.getPassword());
        User existUser = userMapper.selectOne(wrapper);
        if (existUser == null) {
            return Result.error("用户名或密码错误");
        }
        existUser.setPassword(null);
        return Result.success(existUser);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, user.getUsername());
        User existUser = userMapper.selectOne(wrapper);
        if (existUser != null) {
            return Result.error("用户名已存在");
        }
        userMapper.insert(user);
        user.setPassword(null);
        return Result.success(user);
    }
}
