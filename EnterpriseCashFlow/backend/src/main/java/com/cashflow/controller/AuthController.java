package com.cashflow.controller;

import com.cashflow.common.Result;
import com.cashflow.dto.LoginRequest;
import com.cashflow.dto.LoginResponse;
import com.cashflow.entity.SysUser;
import com.cashflow.mapper.SysUserMapper;
import com.cashflow.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SysUserMapper sysUserMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(SysUserMapper sysUserMapper, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.sysUserMapper = sysUserMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        SysUser user = sysUserMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, request.getUsername())
        );
        if (user == null) {
            return Result.error(401, "用户不存在");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return Result.error(401, "密码错误");
        }
        if (user.getStatus() != null && user.getStatus() != 1) {
            return Result.error(403, "账号已被禁用");
        }
        String token = jwtTokenProvider.createToken(user.getId(), user.getUsername());
        LoginResponse response = new LoginResponse(token, user.getId(), user.getUsername(), user.getRealName());
        return Result.success(response);
    }
}
