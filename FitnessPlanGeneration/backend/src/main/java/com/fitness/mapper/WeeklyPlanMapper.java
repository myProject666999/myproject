package com.fitness.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fitness.entity.WeeklyPlan;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WeeklyPlanMapper extends BaseMapper<WeeklyPlan> {
}
