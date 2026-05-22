package com.bmi.tracking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bmi.tracking.common.BusinessException;
import com.bmi.tracking.common.UserContext;
import com.bmi.tracking.entity.User;
import com.bmi.tracking.mapper.UserMapper;
import com.bmi.tracking.service.UserService;
import com.bmi.tracking.util.JwtUtil;
import com.bmi.tracking.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Map<String, Object> login(String username, String password) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (!user.getPassword().equals(PasswordUtil.sha256(password))) {
            throw new BusinessException("密码错误");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("nickname", user.getNickname());
        result.put("height", user.getHeight());
        return result;
    }

    @Override
    public void register(String username, String password, String nickname) {
        User exist = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (exist != null) {
            throw new BusinessException("用户名已存在");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(PasswordUtil.sha256(password));
        user.setNickname(nickname == null ? username : nickname);
        user.setHeight(BigDecimal.valueOf(170.0));
        userMapper.insert(user);
    }

    @Override
    public User getCurrentUser() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(401, "未登录");
        }
        User user = userMapper.selectById(userId);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    @Override
    public void updateHeight(BigDecimal height) {
        Long userId = UserContext.getUserId();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        user.setHeight(height);
        userMapper.updateById(user);
    }
}
