package com.smartdoor.service;

import com.smartdoor.dto.LoginDTO;
import com.smartdoor.dto.LoginVO;
import com.smartdoor.common.Result;

public interface AuthService {
    Result<LoginVO> login(LoginDTO loginDTO);
    Result<Void> logout();
}
