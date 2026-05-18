package com.habit.tracking.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.habit.tracking.entity.Habit;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface HabitRepository extends BaseMapper<Habit> {
}
