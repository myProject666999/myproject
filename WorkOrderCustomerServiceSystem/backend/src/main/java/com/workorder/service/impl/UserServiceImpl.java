package com.workorder.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.workorder.constant.TicketConstant;
import com.workorder.entity.User;
import com.workorder.mapper.UserMapper;
import com.workorder.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public User getUserByUsername(String username) {
        return userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
    }

    @Override
    public List<User> getAgents() {
        return userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .eq(User::getRole, TicketConstant.ROLE_AGENT)
                        .eq(User::getStatus, TicketConstant.USER_STATUS_ACTIVE)
        );
    }

    @Override
    public List<User> getCustomers() {
        return userMapper.selectList(
                new LambdaQueryWrapper<User>()
                        .eq(User::getRole, TicketConstant.ROLE_CUSTOMER)
                        .eq(User::getStatus, TicketConstant.USER_STATUS_ACTIVE)
        );
    }

    @Override
    public List<User> getAllUsers() {
        return userMapper.selectList(null);
    }
}