package com.bmi.tracking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bmi.tracking.entity.Reminder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReminderMapper extends BaseMapper<Reminder> {
}
