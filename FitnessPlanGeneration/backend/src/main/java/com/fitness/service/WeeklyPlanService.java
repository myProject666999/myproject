package com.fitness.service;

import com.fitness.vo.WeeklyPlanVO;

public interface WeeklyPlanService {
    WeeklyPlanVO getCurrentWeeklyPlan(Long userId);
    WeeklyPlanVO getWeeklyPlanById(Long id);
}
