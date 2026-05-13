package com.recycling.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.recycling.dto.LoginDTO;
import com.recycling.dto.RegisterDTO;
import com.recycling.entity.User;
import com.recycling.vo.LoginVO;

public interface UserService extends IService<User> {
    LoginVO login(LoginDTO loginDTO);
    User register(RegisterDTO registerDTO);
    User getByUsername(String username);
    User getByPhone(String phone);
}
