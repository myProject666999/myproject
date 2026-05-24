package com.logistics.controller;

import com.logistics.dto.LoginDTO;
import com.logistics.entity.User;
import com.logistics.mapper.UserMapper;
import com.logistics.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginDTO dto) {
        User user = userMapper.selectByUsernameAndPassword(dto.getUsername(), dto.getPassword());
        if (user == null) {
            return Result.error(401, "用户名或密码错误");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("realName", user.getRealName());
        data.put("role", user.getRole());
        return Result.success(data);
    }
}
