package com.market.stall.controller;

import com.market.stall.common.Result;
import com.market.stall.dto.LoginDTO;
import com.market.stall.dto.RegisterDTO;
import com.market.stall.service.AuthService;
import com.market.stall.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginVO> login(@RequestBody @Valid LoginDTO dto) {
        return Result.success(authService.login(dto));
    }

    @PostMapping("/register")
    public Result<Void> register(@RequestBody @Valid RegisterDTO dto) {
        authService.register(dto);
        return Result.success();
    }
}
