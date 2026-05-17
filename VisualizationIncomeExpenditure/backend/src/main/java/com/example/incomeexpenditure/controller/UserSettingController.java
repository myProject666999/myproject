package com.example.incomeexpenditure.controller;

import com.example.incomeexpenditure.common.Result;
import com.example.incomeexpenditure.entity.UserSetting;
import com.example.incomeexpenditure.service.UserSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
public class UserSettingController {

    @Autowired
    private UserSettingService userSettingService;

    private static final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public Result<UserSetting> getUserSetting() {
        return Result.success(userSettingService.getUserSetting(DEFAULT_USER_ID));
    }

    @PutMapping
    public Result<?> updateUserSetting(@RequestBody UserSetting setting) {
        setting.setUserId(DEFAULT_USER_ID);
        UserSetting existing = userSettingService.getUserSetting(DEFAULT_USER_ID);
        setting.setId(existing.getId());
        int result = userSettingService.updateUserSetting(setting);
        return result > 0 ? Result.success() : Result.error("更新失败");
    }
}
