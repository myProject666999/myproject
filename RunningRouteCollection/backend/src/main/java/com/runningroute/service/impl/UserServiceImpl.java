package com.runningroute.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.runningroute.entity.User;
import com.runningroute.mapper.UserMapper;
import com.runningroute.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public User login(String username, String password) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username).eq("password", password);
        return getOne(wrapper);
    }

    @Override
    public User register(User user) {
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", user.getUsername());
        User existUser = getOne(wrapper);
        if (existUser != null) {
            throw new RuntimeException("用户名已存在");
        }
        save(user);
        return user;
    }
}
