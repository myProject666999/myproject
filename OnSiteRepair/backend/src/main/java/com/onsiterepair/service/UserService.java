package com.onsiterepair.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.onsiterepair.dto.LoginDTO;
import com.onsiterepair.dto.RegisterDTO;
import com.onsiterepair.entity.User;
import com.onsiterepair.vo.LoginVO;

public interface UserService extends IService<User> {
    LoginVO login(LoginDTO dto);
    LoginVO register(RegisterDTO dto);
    User getByPhone(String phone);
    User updateProfile(Long userId, User user);
}
