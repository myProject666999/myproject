package com.restaurant.evaluation.controller;

import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.dto.LoginDTO;
import com.restaurant.evaluation.entity.User;
import com.restaurant.evaluation.service.UserService;
import com.restaurant.evaluation.util.UserContext;
import com.restaurant.evaluation.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<UserVO> login(@Validated @RequestBody LoginDTO loginDTO) {
        return userService.login(loginDTO);
    }

    @GetMapping("/current")
    public Result<User> getCurrentUser() {
        Long userId = UserContext.getUserId();
        return userService.getCurrentUser(userId);
    }

}
