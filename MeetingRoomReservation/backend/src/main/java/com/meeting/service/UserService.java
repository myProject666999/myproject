package com.meeting.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.meeting.dto.LoginDTO;
import com.meeting.entity.User;

public interface UserService extends IService<User> {

    User login(LoginDTO dto);

    User getUserByUsername(String username);

    User getUserById(Long id);
}
