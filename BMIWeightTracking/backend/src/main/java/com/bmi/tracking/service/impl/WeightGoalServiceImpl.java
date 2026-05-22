package com.bmi.tracking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.bmi.tracking.common.UserContext;
import com.bmi.tracking.entity.WeightGoal;
import com.bmi.tracking.entity.WeightRecord;
import com.bmi.tracking.mapper.WeightGoalMapper;
import com.bmi.tracking.mapper.WeightRecordMapper;
import com.bmi.tracking.service.WeightGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class WeightGoalServiceImpl implements WeightGoalService {

    @Autowired
    private WeightGoalMapper weightGoalMapper;

    @Autowired
    private WeightRecordMapper weightRecordMapper;

    @Override
    public void setGoal(BigDecimal targetWeight, LocalDate targetDate) {
        Long userId = UserContext.getUserId();
        WeightGoal exist = weightGoalMapper.selectOne(
                new LambdaQueryWrapper<WeightGoal>().eq(WeightGoal::getUserId, userId)
        );
        if (exist == null) {
            WeightGoal goal = new WeightGoal();
            goal.setUserId(userId);
            goal.setTargetWeight(targetWeight);
            goal.setTargetDate(targetDate);
            weightGoalMapper.insert(goal);
        } else {
            exist.setTargetWeight(targetWeight);
            exist.setTargetDate(targetDate);
            weightGoalMapper.updateById(exist);
        }
    }

    @Override
    public WeightGoal getGoal() {
        Long userId = UserContext.getUserId();
        return weightGoalMapper.selectOne(
                new LambdaQueryWrapper<WeightGoal>().eq(WeightGoal::getUserId, userId)
        );
    }

    @Override
    public Map<String, Object> getGoalProgress() {
        Long userId = UserContext.getUserId();
        WeightGoal goal = getGoal();
        Map<String, Object> result = new LinkedHashMap<>();
        if (goal == null) {
            return result;
        }
        WeightRecord first = weightRecordMapper.selectOne(
                new LambdaQueryWrapper<WeightRecord>()
                        .eq(WeightRecord::getUserId, userId)
                        .orderByAsc(WeightRecord::getRecordDate)
                        .last("LIMIT 1")
        );
        WeightRecord latest = weightRecordMapper.selectOne(
                new LambdaQueryWrapper<WeightRecord>()
                        .eq(WeightRecord::getUserId, userId)
                        .orderByDesc(WeightRecord::getRecordDate)
                        .last("LIMIT 1")
        );

        result.put("goal", goal);
        if (first != null) {
            result.put("startWeight", first.getWeight());
        }
        if (latest != null) {
            result.put("currentWeight", latest.getWeight());
        }
        if (first != null && latest != null) {
            BigDecimal diff = latest.getWeight().subtract(goal.getTargetWeight());
            result.put("diffToGoal", diff);
            BigDecimal total = first.getWeight().subtract(goal.getTargetWeight());
            BigDecimal done = first.getWeight().subtract(latest.getWeight());
            if (total.abs().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percent = done.abs().divide(total.abs(), 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                result.put("progressPercent", percent);
            }
        }
        if (goal.getTargetDate() != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
            result.put("daysLeft", days);
        }
        return result;
    }
}
