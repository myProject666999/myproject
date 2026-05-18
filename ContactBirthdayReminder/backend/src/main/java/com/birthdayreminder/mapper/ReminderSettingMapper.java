package com.birthdayreminder.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.birthdayreminder.entity.ReminderSetting;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReminderSettingMapper extends BaseMapper<ReminderSetting> {
}
