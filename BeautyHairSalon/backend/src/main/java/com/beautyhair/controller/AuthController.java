
package com.beautyhair.controller;

import com.beautyhair.common.Result;
import com.beautyhair.dto.LoginDTO;
import com.beautyhair.dto.LoginUserVO;
import com.beautyhair.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginUserVO> login(@Validated @RequestBody LoginDTO loginDTO) {
        LoginUserVO loginUserVO = authService.login(loginDTO);
        return Result.success("登录成功", loginUserVO);
    }

    @GetMapping("/me")
    public Result<LoginUserVO> getCurrentUser() {
        LoginUserVO loginUserVO = authService.getCurrentUserInfo();
        return Result.success(loginUserVO);
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }
}
