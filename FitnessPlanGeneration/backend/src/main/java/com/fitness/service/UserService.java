package com.fitness.service;

import com.fitness.dto.LoginDTO;
import com.fitness.dto.RegisterDTO;
import com.fitness.entity.User;

public interface UserService {
    User login(LoginDTO dto);
    User register(RegisterDTO dto);
    User getById(Long id);
}
