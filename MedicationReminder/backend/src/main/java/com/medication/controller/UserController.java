package com.medication.controller;

import com.medication.common.Result;
import com.medication.entity.User;
import com.medication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public Result<List<User>> list() {
        return Result.success(userService.listAll());
    }

    @GetMapping("/{id}")
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @PostMapping
    public Result<User> save(@RequestBody User user) {
        userService.save(user);
        return Result.success(user);
    }

    @PutMapping
    public Result<User> update(@RequestBody User user) {
        userService.updateById(user);
        return Result.success(user);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.removeById(id);
        return Result.success();
    }
}
