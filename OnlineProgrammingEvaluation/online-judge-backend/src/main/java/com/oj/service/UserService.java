package com.oj.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.oj.dto.LoginDTO;
import com.oj.dto.RegisterDTO;
import com.oj.entity.User;

public interface UserService extends IService<User> {
    User login(LoginDTO loginDTO);
    User register(RegisterDTO registerDTO);
    User getUserInfo(Long userId);
    IPage<User> getUserPage(int page, int size, String keyword);
    void updateUser(User user);
    void updateStatus(Long userId, Integer status);
    void updateRole(Long userId, Integer role);
}
