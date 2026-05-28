package com.project.cost.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.cost.entity.User;
import com.project.cost.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    public User login(String username, String password) {
        User user = getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }

    public User createUser(User user) {
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());
        user.setStatus(1);
        save(user);
        return user;
    }

    public User updateUser(User user) {
        user.setUpdateTime(LocalDateTime.now());
        updateById(user);
        return user;
    }

    public List<User> getUsersByDept(Long deptId) {
        return list(new LambdaQueryWrapper<User>().eq(User::getDeptId, deptId));
    }

    public List<User> getAllUsers() {
        return list(new LambdaQueryWrapper<User>().eq(User::getStatus, 1));
    }
}
