package com.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fitness.dto.LoginDTO;
import com.fitness.dto.RegisterDTO;
import com.fitness.entity.User;
import com.fitness.mapper.UserMapper;
import com.fitness.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import cn.hutool.crypto.SecureUtil;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User login(LoginDTO dto) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", dto.getUsername());
        User user = userMapper.selectOne(wrapper);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        String encodedPwd = SecureUtil.md5(dto.getPassword());
        if (!user.getPassword().equals(encodedPwd)) {
            throw new RuntimeException("密码错误");
        }
        return user;
    }

    @Override
    public User register(RegisterDTO dto) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", dto.getUsername());
        if (userMapper.selectOne(wrapper) != null) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(SecureUtil.md5(dto.getPassword()));
        user.setNickname(dto.getNickname());
        user.setGender(dto.getGender());
        user.setAge(dto.getAge());
        user.setHeight(dto.getHeight());
        user.setWeight(dto.getWeight());
        userMapper.insert(user);
        return user;
    }

    @Override
    public User getById(Long id) {
        return userMapper.selectById(id);
    }
}
