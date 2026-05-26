package com.recruitment.controller;

import com.recruitment.common.Result;
import com.recruitment.dto.LoginDTO;
import com.recruitment.dto.RegisterDTO;
import com.recruitment.entity.User;
import com.recruitment.vo.LoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "认证接口")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @ApiOperation("登录")
    @PostMapping("/login")
    public Result<LoginVO> login(@Validated @RequestBody LoginDTO loginDTO) {
        return Result.ok();
    }

    @ApiOperation("注册")
    @PostMapping("/register")
    public Result<Void> register(@Validated @RequestBody RegisterDTO registerDTO) {
        return Result.ok();
    }

    @ApiOperation("获取当前用户信息")
    @GetMapping("/userinfo")
    @PreAuthorize("hasAnyRole('JOB_SEEKER', 'HR')")
    public Result<User> getUserInfo() {
        return Result.ok();
    }
}
