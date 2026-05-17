package com.example.incomeexpenditure.service;

import com.example.incomeexpenditure.entity.UserSetting;
import com.example.incomeexpenditure.mapper.UserSettingMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class UserSettingService {

    @Autowired
    private UserSettingMapper userSettingMapper;

    public UserSetting getUserSetting(Long userId) {
        UserSetting setting = userSettingMapper.findByUserId(userId);
        if (setting == null) {
            setting = new UserSetting();
            setting.setUserId(userId);
            setting.setColorThreshold1(new BigDecimal("100.00"));
            setting.setColorThreshold2(new BigDecimal("300.00"));
            setting.setColorThreshold3(new BigDecimal("500.00"));
            setting.setColor1("#e8f5e9");
            setting.setColor2("#c8e6c9");
            setting.setColor3("#81c784");
            setting.setColor4("#4caf50");
            userSettingMapper.insert(setting);
        }
        return setting;
    }

    public int updateUserSetting(UserSetting setting) {
        return userSettingMapper.update(setting);
    }
}
