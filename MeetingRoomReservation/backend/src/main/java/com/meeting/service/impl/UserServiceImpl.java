package com.meeting.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.meeting.dto.LoginDTO;
import com.meeting.entity.User;
import com.meeting.exception.BusinessException;
import com.meeting.mapper.UserMapper;
import com.meeting.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public User login(LoginDTO dto) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, dto.getUsername())
                .eq(User::getStatus, 1);
        User user = getOne(wrapper);
        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }
        String encryptedPassword = encryptPassword(dto.getPassword());
        if (!encryptedPassword.equals(user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        return user;
    }

    @Override
    public User getUserByUsername(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        return getOne(wrapper);
    }

    @Override
    public User getUserById(Long id) {
        return getById(id);
    }

    private String encryptPassword(String password) {
        return DigestUtils.md5DigestAsHex(password.getBytes(StandardCharsets.UTF_8));
    }
}
