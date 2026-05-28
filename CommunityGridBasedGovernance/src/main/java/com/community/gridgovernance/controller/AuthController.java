package com.community.gridgovernance.controller;

import com.community.gridgovernance.common.Result;
import com.community.gridgovernance.dto.LoginDTO;
import com.community.gridgovernance.entity.SysUser;
import com.community.gridgovernance.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private SysUserService sysUserService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Validated @RequestBody LoginDTO dto) {
        SysUser user = sysUserService.login(dto.getUsername(), dto.getPassword());
        user.setPassword(null);
        Map<String, Object> data = new HashMap<>();
        data.put("token", "mock_token_" + user.getId());
        data.put("user", user);
        return Result.success(data);
    }

    @GetMapping("/user/{id}")
    public Result<SysUser> getUserInfo(@PathVariable Long id) {
        SysUser user = sysUserService.getById(id);
        user.setPassword(null);
        return Result.success(user);
    }
}
