package com.recruitment.controller;

import com.recruitment.common.Result;
import com.recruitment.dto.LoginDTO;
import com.recruitment.dto.RegisterDTO;
import com.recruitment.entity.User;
import com.recruitment.service.AuthService;
import com.recruitment.service.UserService;
import com.recruitment.vo.LoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "认证接口")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @ApiOperation("登录")
    @PostMapping("/login")
    public Result<LoginVO> login(@Validated @RequestBody LoginDTO loginDTO) {
        return Result.ok(authService.login(loginDTO));
    }

    @ApiOperation("注册")
    @PostMapping("/register")
    public Result<User> register(@Validated @RequestBody RegisterDTO registerDTO) {
        return Result.ok(authService.register(registerDTO));
    }

    @ApiOperation("获取当前用户信息")
    @GetMapping("/userinfo")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<User> getUserInfo() {
        return Result.ok(userService.getCurrentUser());
    }
}