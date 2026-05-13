package com.gym.membership.controller;

import com.gym.membership.common.PageResult;
import com.gym.membership.common.Result;
import com.gym.membership.dto.LoginDTO;
import com.gym.membership.dto.UserRegisterDTO;
import com.gym.membership.entity.Role;
import com.gym.membership.service.UserService;
import com.gym.membership.vo.LoginVO;
import com.gym.membership.vo.UserVO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/auth/login")
    public Result<LoginVO> login(@Validated @RequestBody LoginDTO dto) {
        LoginVO vo = userService.login(dto);
        return Result.success("登录成功", vo);
    }

    @PostMapping("/auth/register")
    public Result<Void> register(@Validated @RequestBody UserRegisterDTO dto) {
        userService.register(dto);
        return Result.success();
    }

    @GetMapping("/auth/roles")
    public Result<List<Role>> getRoleList() {
        List<Role> roles = userService.getRoleList();
        return Result.success(roles);
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<PageResult<UserVO>> getUserPage(
            @RequestParam(defaultValue = "1") Long pageNum,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        PageResult<UserVO> result = userService.getUserPage(pageNum, pageSize, keyword, status);
        return Result.success(result);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<UserVO> getUserById(@PathVariable Long id) {
        UserVO vo = userService.getUserById(id);
        return Result.success(vo);
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> createUser(@Validated @RequestBody UserRegisterDTO dto) {
        userService.register(dto);
        return Result.success("创建成功", null);
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateUser(@PathVariable Long id, @Validated @RequestBody UserRegisterDTO dto) {
        userService.updateUser(id, dto);
        return Result.success("更新成功", null);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success("删除成功", null);
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.updateStatus(id, status);
        return Result.success("状态更新成功", null);
    }

    @GetMapping("/users/coaches")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('COACH')")
    public Result<List<UserVO>> getCoachList() {
        List<UserVO> coaches = userService.getCoachList();
        return Result.success(coaches);
    }

    @GetMapping("/users/members")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<List<UserVO>> getMemberList() {
        List<UserVO> members = userService.getMemberList();
        return Result.success(members);
    }
}
