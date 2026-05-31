package com.market.stall.service;

import com.market.stall.dto.LoginDTO;
import com.market.stall.dto.RegisterDTO;
import com.market.stall.vo.LoginVO;

public interface AuthService {

    LoginVO login(LoginDTO dto);

    void register(RegisterDTO dto);
}
