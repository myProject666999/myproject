package com.emojipack.service;

import com.emojipack.dto.LoginDTO;
import com.emojipack.dto.RegisterDTO;
import com.emojipack.entity.User;
import com.emojipack.vo.LoginVO;
import com.emojipack.vo.UserVO;

public interface UserService {

    LoginVO login(LoginDTO dto);

    UserVO register(RegisterDTO dto);

    UserVO getUserInfo(Long userId);

    UserVO updateUser(Long userId, User user);

    User getById(Long id);
}
