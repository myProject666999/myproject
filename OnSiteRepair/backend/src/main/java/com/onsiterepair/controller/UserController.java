package com.onsiterepair.controller;

import com.onsiterepair.common.Result;
import com.onsiterepair.dto.LoginDTO;
import com.onsiterepair.dto.RegisterDTO;
import com.onsiterepair.entity.User;
import com.onsiterepair.service.UserService;
import com.onsiterepair.vo.LoginVO;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(userService.login(dto));
    }

    @PostMapping("/register")
    public Result<LoginVO> register(@Valid @RequestBody RegisterDTO dto) {
        return Result.success(userService.register(dto));
    }

    @GetMapping("/info")
    public Result<User> getInfo(@RequestHeader("Authorization") String token) {
        return Result.success();
    }

    @PutMapping("/profile")
    public Result<User> updateProfile(@RequestAttribute("userId") Long userId, @RequestBody User user) {
        return Result.success(userService.updateProfile(userId, user));
    }
}
