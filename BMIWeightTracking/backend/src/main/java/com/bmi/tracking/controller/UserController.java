package com.bmi.tracking.controller;

import com.bmi.tracking.common.Result;
import com.bmi.tracking.entity.User;
import com.bmi.tracking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public Result<User> me() {
        return Result.success(userService.getCurrentUser());
    }

    @PutMapping("/height")
    public Result<Void> updateHeight(@RequestBody Map<String, BigDecimal> body) {
        userService.updateHeight(body.get("height"));
        return Result.success();
    }
}
