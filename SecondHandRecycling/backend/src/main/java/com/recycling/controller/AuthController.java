package com.recycling.controller;

import com.recycling.common.Result;
import com.recycling.dto.LoginDTO;
import com.recycling.dto.RegisterDTO;
import com.recycling.entity.User;
import com.recycling.security.UserPrincipal;
import com.recycling.service.UserService;
import com.recycling.vo.LoginVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(userService.login(loginDTO));
    }

    @PostMapping("/register")
    public Result<User> register(@Valid @RequestBody RegisterDTO registerDTO) {
        return Result.success(userService.register(registerDTO));
    }

    @GetMapping("/me")
    public Result<User> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return Result.error("未登录");
        }
        User user = userService.getById(principal.getUserId());
        user.setPassword(null);
        return Result.success(user);
    }
}
