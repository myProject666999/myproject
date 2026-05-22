package com.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fitness.entity.*;
import com.fitness.mapper.*;
import com.fitness.service.WeeklyPlanService;
import com.fitness.vo.DailyPlanExerciseVO;
import com.fitness.vo.DailyPlanVO;
import com.fitness.vo.WeeklyPlanVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WeeklyPlanServiceImpl implements WeeklyPlanService {

    @Autowired
    private WeeklyPlanMapper weeklyPlanMapper;

    @Autowired
    private DailyPlanMapper dailyPlanMapper;

    @Autowired
    private DailyPlanExerciseMapper dailyPlanExerciseMapper;

    @Autowired
    private ExerciseMapper exerciseMapper;

    @Override
    public WeeklyPlanVO getCurrentWeeklyPlan(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);

        QueryWrapper<WeeklyPlan> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId)
                .eq("week_start_date", weekStart)
                .orderByDesc("created_at")
                .last("LIMIT 1");
        WeeklyPlan wp = weeklyPlanMapper.selectOne(wrapper);
        if (wp == null) {
            return null;
        }
        return buildWeeklyPlanVO(wp);
    }

    @Override
    public WeeklyPlanVO getWeeklyPlanById(Long id) {
        WeeklyPlan wp = weeklyPlanMapper.selectById(id);
        if (wp == null) {
            return null;
        }
        return buildWeeklyPlanVO(wp);
    }

    private WeeklyPlanVO buildWeeklyPlanVO(WeeklyPlan wp) {
        WeeklyPlanVO vo = new WeeklyPlanVO();
        vo.setId(wp.getId());
        vo.setUserId(wp.getUserId());
        vo.setQuestionnaireId(wp.getQuestionnaireId());
        vo.setWeekStartDate(wp.getWeekStartDate());
        vo.setWeekEndDate(wp.getWeekEndDate());
        vo.setGoal(wp.getGoal());
        vo.setTotalTrainingDays(wp.getTotalTrainingDays());
        vo.setStatus(wp.getStatus());

        QueryWrapper<DailyPlan> dpWrapper = new QueryWrapper<>();
        dpWrapper.eq("weekly_plan_id", wp.getId()).orderByAsc("plan_date");
        List<DailyPlan> dps = dailyPlanMapper.selectList(dpWrapper);

        Map<Long, Exercise> exerciseCache = new HashMap<>();
        List<DailyPlanVO> dpVOList = new ArrayList<>();
        for (DailyPlan dp : dps) {
            DailyPlanVO dpVO = buildDailyPlanVO(dp, exerciseCache);
            dpVOList.add(dpVO);
        }
        vo.setDailyPlans(dpVOList);

        return vo;
    }

    private DailyPlanVO buildDailyPlanVO(DailyPlan dp, Map<Long, Exercise> exerciseCache) {
        DailyPlanVO vo = new DailyPlanVO();
        vo.setId(dp.getId());
        vo.setWeeklyPlanId(dp.getWeeklyPlanId());
        vo.setPlanDate(dp.getPlanDate());
        vo.setDayOfWeek(dp.getDayOfWeek());
        vo.setIsRestDay(dp.getIsRestDay());
        vo.setTrainingFocus(dp.getTrainingFocus());
        vo.setTotalDuration(dp.getTotalDuration());
        vo.setTotalCalories(dp.getTotalCalories());
        vo.setStatus(dp.getStatus());

        if (dp.getIsRestDay() != null && dp.getIsRestDay() == 1) {
            vo.setExercises(new ArrayList<>());
            return vo;
        }

        QueryWrapper<DailyPlanExercise> dpeWrapper = new QueryWrapper<>();
        dpeWrapper.eq("daily_plan_id", dp.getId()).orderByAsc("exercise_order");
        List<DailyPlanExercise> dpes = dailyPlanExerciseMapper.selectList(dpeWrapper);

        List<DailyPlanExerciseVO> exerciseVOList = new ArrayList<>();
        for (DailyPlanExercise dpe : dpes) {
            Exercise ex = getExerciseFromCache(dpe.getExerciseId(), exerciseCache);
            DailyPlanExerciseVO evo = new DailyPlanExerciseVO();
            evo.setId(dpe.getId());
            evo.setExerciseId(dpe.getExerciseId());
            evo.setExerciseName(ex != null ? ex.getName() : "");
            evo.setCategory(ex != null ? ex.getCategory() : "");
            evo.setMuscleGroup(ex != null ? ex.getMuscleGroup() : "");
            evo.setExerciseOrder(dpe.getExerciseOrder());
            evo.setTargetSets(dpe.getTargetSets());
            evo.setTargetReps(dpe.getTargetReps());
            evo.setRestSeconds(dpe.getRestSeconds());
            evo.setCompletedSets(dpe.getCompletedSets());
            evo.setEquipment(ex != null ? ex.getEquipment() : "");
            evo.setDescription(ex != null ? ex.getDescription() : "");
            evo.setCaloriesPerSet(ex != null ? ex.getCaloriesPerSet() : BigDecimal.ZERO);
            exerciseVOList.add(evo);
        }
        vo.setExercises(exerciseVOList);

        return vo;
    }

    private Exercise getExerciseFromCache(Long id, Map<Long, Exercise> cache) {
        if (cache.containsKey(id)) {
            return cache.get(id);
        }
        Exercise ex = exerciseMapper.selectById(id);
        if (ex != null) {
            cache.put(id, ex);
        }
        return ex;
    }
}
