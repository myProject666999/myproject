package com.emojipack.controller;

import com.emojipack.common.Result;
import com.emojipack.dto.LoginDTO;
import com.emojipack.dto.RegisterDTO;
import com.emojipack.service.UserService;
import com.emojipack.vo.LoginVO;
import com.emojipack.vo.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(userService.login(dto));
    }

    @PostMapping("/register")
    public Result<UserVO> register(@Valid @RequestBody RegisterDTO dto) {
        return Result.success(userService.register(dto));
    }
}
