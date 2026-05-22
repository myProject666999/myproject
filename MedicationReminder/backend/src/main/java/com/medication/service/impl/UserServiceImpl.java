package com.medication.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.medication.entity.User;
import com.medication.mapper.UserMapper;
import com.medication.service.UserService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public List<User> listAll() {
        return list();
    }

    @Override
    public User getById(Long id) {
        return super.getById(id);
    }
}
