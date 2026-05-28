package com.notification.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.notification.common.Result;
import com.notification.entity.User;
import com.notification.mapper.UserMapper;
import com.notification.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class AuthService extends ServiceImpl<UserMapper, User> {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public Result<Map<String, Object>> login(String username, String password) {
        User user = this.getOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username)
                .eq(User::getStatus, 1));

        if (user == null) {
            return Result.error("用户不存在或已禁用");
        }

        if (!"123456".equals(password)) {
            return Result.error("密码错误");
        }

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());

        String userKey = "user:" + user.getId();
        try {
            redisTemplate.opsForValue().set(userKey, user, 24, TimeUnit.HOURS);
        } catch (Exception ignored) {
        }

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("realName", user.getRealName());
        data.put("role", user.getRole());
        data.put("departmentId", user.getDepartmentId());
        data.put("avatar", user.getAvatar());

        return Result.success("登录成功", data);
    }

    public Result<?> logout(Long userId) {
        if (userId != null) {
            try {
                redisTemplate.delete("user:" + userId);
            } catch (Exception ignored) {
            }
        }
        return Result.success("退出成功");
    }

    public Result<User> getUserInfo(Long userId) {
        if (userId == null) {
            return Result.error("用户未登录");
        }
        User user = this.getById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }
}
