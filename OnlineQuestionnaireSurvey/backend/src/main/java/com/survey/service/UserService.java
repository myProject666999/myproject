package com.survey.service;

import com.survey.dto.LoginDTO;
import com.survey.dto.RegisterDTO;
import com.survey.dto.UserVO;
import com.survey.entity.User;
import jakarta.servlet.http.HttpServletRequest;

public interface UserService {

    User login(LoginDTO loginDTO);

    User register(RegisterDTO registerDTO);

    User getById(Long id);

    UserVO getCurrentUser(HttpServletRequest request);
}
