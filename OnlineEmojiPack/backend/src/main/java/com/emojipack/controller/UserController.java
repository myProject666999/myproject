package com.emojipack.controller;

import com.emojipack.common.Result;
import com.emojipack.entity.User;
import com.emojipack.service.UserService;
import com.emojipack.vo.UserVO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public Result<UserVO> getCurrentUser(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(userService.getUserInfo(userId));
    }

    @PutMapping("/me")
    public Result<UserVO> updateCurrentUser(@RequestBody User user, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return Result.success(userService.updateUser(userId, user));
    }
}
