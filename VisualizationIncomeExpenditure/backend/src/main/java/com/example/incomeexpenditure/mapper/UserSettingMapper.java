package com.example.incomeexpenditure.mapper;

import com.example.incomeexpenditure.entity.UserSetting;
import org.apache.ibatis.annotations.Param;

public interface UserSettingMapper {
    UserSetting findByUserId(@Param("userId") Long userId);
    int insert(UserSetting setting);
    int update(UserSetting setting);
}
