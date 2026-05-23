package com.survey.controller;

import com.survey.common.JwtTokenUtil;
import com.survey.common.Result;
import com.survey.dto.LoginDTO;
import com.survey.dto.RegisterDTO;
import com.survey.dto.UserVO;
import com.survey.entity.User;
import com.survey.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthController(UserService userService, JwtTokenUtil jwtTokenUtil) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/login")
    public Result<UserVO> login(@Valid @RequestBody LoginDTO dto) {
        User user = userService.login(dto);
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        vo.setToken(jwtTokenUtil.generateToken(user));
        return Result.success(vo);
    }

    @PostMapping("/register")
    public Result<UserVO> register(@Valid @RequestBody RegisterDTO dto) {
        User user = userService.register(dto);
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        vo.setToken(jwtTokenUtil.generateToken(user));
        return Result.success(vo);
    }

    @GetMapping("/me")
    public Result<UserVO> getCurrentUser(HttpServletRequest request) {
        return Result.success(userService.getCurrentUser(request));
    }
}
