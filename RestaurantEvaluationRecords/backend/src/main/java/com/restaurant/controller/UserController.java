package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.entity.User;
import com.restaurant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public Result<List<User>> getAllUsers() {
        return Result.success(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(Result::success)
                .orElse(Result.error("用户不存在"));
    }

    @GetMapping("/username/{username}")
    public Result<User> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(Result::success)
                .orElse(Result.error("用户不存在"));
    }

    @PostMapping
    public Result<User> createUser(@RequestBody User user) {
        return Result.success(userService.createUser(user));
    }

    @PostMapping("/login")
    public Result<User> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        return userService.getUserByUsername(username)
                .filter(user -> user.getPassword().equals(password))
                .map(Result::success)
                .orElse(Result.error("用户名或密码错误"));
    }

    @PutMapping("/{id}")
    public Result<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            return Result.success(userService.updateUser(id, userDetails));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }
}
