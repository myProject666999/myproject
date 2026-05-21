package com.nutrition.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nutrition.entity.NutritionGoal;
import com.nutrition.mapper.NutritionGoalMapper;
import org.springframework.stereotype.Service;

@Service
public class NutritionGoalService extends ServiceImpl<NutritionGoalMapper, NutritionGoal> {

    public NutritionGoal getCurrentGoal() {
        return baseMapper.selectOne(
                new LambdaQueryWrapper<NutritionGoal>()
                        .orderByDesc(NutritionGoal::getUpdateTime)
                        .last("LIMIT 1")
        );
    }

    public NutritionGoal saveOrUpdateGoal(NutritionGoal goal) {
        NutritionGoal existing = getCurrentGoal();
        if (existing != null) {
            goal.setId(existing.getId());
            updateById(goal);
            return goal;
        } else {
            save(goal);
            return goal;
        }
    }
}
