package com.port.container.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.port.container.aspect.OperationLog;
import com.port.container.common.PageResult;
import com.port.container.common.R;
import com.port.container.dto.LoginDTO;
import com.port.container.entity.SysUser;
import com.port.container.service.SysUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class SysUserController {

    @Autowired
    private SysUserService sysUserService;

    @PostMapping("/login")
    @OperationLog(module = "用户管理", operationType = "登录", description = "用户登录")
    public R<SysUser> login(@Valid @RequestBody LoginDTO dto) {
        SysUser user = sysUserService.login(dto);
        return user != null ? R.success(user) : R.fail("用户名或密码错误");
    }

    @GetMapping("/list")
    public R<PageResult<SysUser>> list(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String realName,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        IPage<SysUser> page = sysUserService.page(current != null ? current : 1L, size != null ? size : 10L);
        return R.success(PageResult.of(page));
    }

    @GetMapping("/{id}")
    public R<SysUser> getById(@PathVariable Long id) {
        return R.success(sysUserService.getById(id));
    }

    @PostMapping("/add")
    @OperationLog(module = "用户管理", operationType = "新增", description = "新增用户")
    public R<Void> add(@Valid @RequestBody SysUser sysUser) {
        boolean result = sysUserService.save(sysUser);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/update")
    @OperationLog(module = "用户管理", operationType = "修改", description = "修改用户")
    public R<Void> update(@Valid @RequestBody SysUser sysUser) {
        boolean result = sysUserService.update(sysUser);
        return result ? R.success() : R.fail();
    }

    @DeleteMapping("/{id}")
    @OperationLog(module = "用户管理", operationType = "删除", description = "删除用户")
    public R<Void> delete(@PathVariable Long id) {
        boolean result = sysUserService.remove(id);
        return result ? R.success() : R.fail();
    }

    @PutMapping("/reset-password/{userId}")
    @OperationLog(module = "用户管理", operationType = "重置密码", description = "重置用户密码")
    public R<Void> resetPassword(@PathVariable Long userId, @RequestBody Map<String, String> params) {
        String newPassword = params.get("newPassword");
        boolean result = sysUserService.resetPassword(userId, newPassword);
        return result ? R.success() : R.fail();
    }
}
