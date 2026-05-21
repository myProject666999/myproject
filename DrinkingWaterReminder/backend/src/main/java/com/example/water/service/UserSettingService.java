package com.example.water.service;

import com.example.water.entity.UserSetting;
import com.example.water.repository.UserSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class UserSettingService {

    @Autowired
    private UserSettingRepository userSettingRepository;

    public UserSetting getUserSetting() {
        return userSettingRepository.findById(1L)
                .orElseGet(() -> {
                    UserSetting setting = new UserSetting();
                    setting.setWeight(new BigDecimal("60.00"));
                    setting.setDailyTarget(2000);
                    setting.setReminderInterval(60);
                    setting.setReminderEnabled(true);
                    return userSettingRepository.save(setting);
                });
    }

    public UserSetting updateUserSetting(UserSetting userSetting) {
        UserSetting existing = getUserSetting();
        if (userSetting.getWeight() != null) {
            existing.setWeight(userSetting.getWeight());
        }
        if (userSetting.getDailyTarget() != null && userSetting.getDailyTarget() > 0) {
            existing.setDailyTarget(userSetting.getDailyTarget());
        }
        if (userSetting.getReminderInterval() != null && userSetting.getReminderInterval() > 0) {
            existing.setReminderInterval(userSetting.getReminderInterval());
        }
        if (userSetting.getReminderEnabled() != null) {
            existing.setReminderEnabled(userSetting.getReminderEnabled());
        }
        return userSettingRepository.save(existing);
    }

    public Integer calculateDailyTarget(BigDecimal weight) {
        BigDecimal baseAmount = new BigDecimal("35");
        return weight.multiply(baseAmount).setScale(0, RoundingMode.HALF_UP).intValue();
    }

    public UserSetting updateWeight(BigDecimal weight) {
        UserSetting setting = getUserSetting();
        setting.setWeight(weight);
        setting.setDailyTarget(calculateDailyTarget(weight));
        return userSettingRepository.save(setting);
    }
}
