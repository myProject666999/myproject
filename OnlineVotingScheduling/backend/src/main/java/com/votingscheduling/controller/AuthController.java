package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.dto.LoginRequest;
import com.votingscheduling.dto.LoginResponse;
import com.votingscheduling.dto.RegisterRequest;
import com.votingscheduling.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @PostMapping("/register")
    public Result<LoginResponse> register(@RequestBody RegisterRequest request) {
        return Result.success(authService.register(request));
    }
}
