package com.giftwishlist.controller;

import com.giftwishlist.common.Result;
import com.giftwishlist.entity.User;
import com.giftwishlist.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<User> login(@RequestBody User user) {
        User loginUser = userService.login(user.getUsername(), user.getPassword());
        if (loginUser == null) {
            return Result.error("用户名或密码错误");
        }
        loginUser.setPassword(null);
        return Result.success(loginUser);
    }

    @PostMapping("/register")
    public Result<User> register(@RequestBody User user) {
        User registered = userService.register(user);
        if (registered == null) {
            return Result.error("用户名已存在");
        }
        registered.setPassword(null);
        return Result.success(registered);
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user != null) {
            user.setPassword(null);
        }
        return Result.success(user);
    }

    @GetMapping
    public Result<List<User>> getAll() {
        List<User> users = userService.list();
        users.forEach(u -> u.setPassword(null));
        return Result.success(users);
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody User user) {
        return Result.success(userService.updateById(user));
    }
}
