package com.votingscheduling.controller;

import com.votingscheduling.common.Result;
import com.votingscheduling.entity.User;
import com.votingscheduling.security.JwtTokenProvider;
import com.votingscheduling.service.UserService;
import javax.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/me")
    public Result<User> getCurrentUser(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        String username = jwtTokenProvider.getUsernameFromToken(token);
        return Result.success(userService.findByUsername(username));
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.findById(id));
    }

    @GetMapping
    public Result<List<User>> getAll() {
        return Result.success(userService.findAll());
    }

    @PutMapping("/{id}")
    public Result<User> update(@PathVariable Long id, @RequestBody User user) {
        return Result.success(userService.updateUser(id, user));
    }

    @PutMapping("/{id}/status")
    public Result<Void> changeStatus(@PathVariable Long id, @RequestParam String status) {
        userService.changeStatus(id, status);
        return Result.success();
    }
}
