package com.bmi.tracking.service;

import com.bmi.tracking.entity.WeightGoal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface WeightGoalService {
    void setGoal(BigDecimal targetWeight, LocalDate targetDate);
    WeightGoal getGoal();
    Map<String, Object> getGoalProgress();
}
