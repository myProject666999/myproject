package com.giftwishlist.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.giftwishlist.entity.User;
import com.giftwishlist.mapper.UserMapper;
import com.giftwishlist.service.UserService;
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
        User exist = getOne(wrapper);
        if (exist != null) {
            return null;
        }
        save(user);
        return user;
    }
}
