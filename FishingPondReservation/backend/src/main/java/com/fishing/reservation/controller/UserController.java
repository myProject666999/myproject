package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.User;
import com.fishing.reservation.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/list")
    public Result<List<User>> list() {
        List<User> list = userMapper.selectList(
            new LambdaQueryWrapper<User>().orderByDesc(User::getCreateTime)
        );
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<User> detail(@PathVariable Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        return Result.success(user);
    }

    @PutMapping("/{id}")
    public Result<User> update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        userMapper.updateById(user);
        return Result.success("更新成功", user);
    }

    @PutMapping("/{id}/balance")
    public Result<User> updateBalance(@PathVariable Long id, @RequestParam java.math.BigDecimal amount) {
        User user = userMapper.selectById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }
        user.setBalance(user.getBalance().add(amount));
        userMapper.updateById(user);
        return Result.success("余额更新成功", user);
    }
}
