package com.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fitness.common.Constants;
import com.fitness.dto.QuestionnaireDTO;
import com.fitness.entity.*;
import com.fitness.mapper.*;
import com.fitness.service.ExerciseService;
import com.fitness.service.QuestionnaireService;
import com.fitness.vo.DailyPlanExerciseVO;
import com.fitness.vo.DailyPlanVO;
import com.fitness.vo.WeeklyPlanVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionnaireServiceImpl implements QuestionnaireService {

    @Autowired
    private QuestionnaireMapper questionnaireMapper;

    @Autowired
    private WeeklyPlanMapper weeklyPlanMapper;

    @Autowired
    private DailyPlanMapper dailyPlanMapper;

    @Autowired
    private DailyPlanExerciseMapper dailyPlanExerciseMapper;

    @Autowired
    private ExerciseService exerciseService;

    @Override
    @Transactional
    public Questionnaire save(QuestionnaireDTO dto) {
        QueryWrapper<Questionnaire> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", dto.getUserId());
        Questionnaire existing = questionnaireMapper.selectOne(wrapper);
        Questionnaire q;
        if (existing != null) {
            q = existing;
        } else {
            q = new Questionnaire();
            q.setUserId(dto.getUserId());
        }
        q.setGoal(dto.getGoal());
        q.setFitnessLevel(dto.getFitnessLevel());
        q.setTrainingDaysPerWeek(dto.getTrainingDaysPerWeek());
        q.setTrainingDurationPerSession(dto.getTrainingDurationPerSession());
        q.setHasInjury(dto.getHasInjury() != null ? dto.getHasInjury() : 0);
        q.setInjuryDetails(dto.getInjuryDetails());
        q.setEquipmentAvailable(dto.getEquipmentAvailable());
        q.setPreferredExercises(dto.getPreferredExercises());
        q.setDislikedExercises(dto.getDislikedExercises());
        if (existing != null) {
            questionnaireMapper.updateById(q);
        } else {
            questionnaireMapper.insert(q);
        }
        return q;
    }

    @Override
    public Questionnaire getByUserId(Long userId) {
        QueryWrapper<Questionnaire> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId);
        return questionnaireMapper.selectOne(wrapper);
    }

    @Override
    @Transactional
    public WeeklyPlanVO generateWeeklyPlan(Long questionnaireId) {
        Questionnaire q = questionnaireMapper.selectById(questionnaireId);
        if (q == null) {
            throw new RuntimeException("问卷不存在");
        }
        String goal = q.getGoal() == Constants.GOAL_MUSCLE ? Constants.SUITABLE_MUSCLE : Constants.SUITABLE_FAT;

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);

        QueryWrapper<WeeklyPlan> wpWrapper = new QueryWrapper<>();
        wpWrapper.eq("user_id", q.getUserId())
                .eq("week_start_date", weekStart);
        WeeklyPlan existingWp = weeklyPlanMapper.selectOne(wpWrapper);
        if (existingWp != null) {
            deleteWeeklyPlan(existingWp);
        }

        WeeklyPlan wp = new WeeklyPlan();
        wp.setUserId(q.getUserId());
        wp.setQuestionnaireId(questionnaireId);
        wp.setWeekStartDate(weekStart);
        wp.setWeekEndDate(weekEnd);
        wp.setGoal(q.getGoal());
        wp.setTotalTrainingDays(q.getTrainingDaysPerWeek());
        wp.setStatus(0);
        weeklyPlanMapper.insert(wp);

        List<LocalDate> trainingDays = selectTrainingDays(weekStart, q.getTrainingDaysPerWeek());
        List<String> focusList = generateFocusList(q.getGoal(), q.getTrainingDaysPerWeek());

        for (int i = 0; i < trainingDays.size(); i++) {
            LocalDate date = trainingDays.get(i);
            String focus = focusList.get(i);

            DailyPlan dp = createDailyPlan(wp.getId(), date, focus, q);
            dailyPlanMapper.insert(dp);

            List<Exercise> exercises = selectExercisesForFocus(focus, goal, q.getFitnessLevel());
            int order = 1;
            BigDecimal totalCalories = BigDecimal.ZERO;
            for (Exercise ex : exercises) {
                DailyPlanExercise dpe = new DailyPlanExercise();
                dpe.setDailyPlanId(dp.getId());
                dpe.setExerciseId(ex.getId());
                dpe.setExerciseOrder(order++);
                dpe.setTargetSets(ex.getTargetSets());
                dpe.setTargetReps(ex.getTargetRepsMin() + "-" + ex.getTargetRepsMax());
                dpe.setRestSeconds(ex.getRestSeconds());
                dpe.setCompletedSets(0);
                dailyPlanExerciseMapper.insert(dpe);
                totalCalories = totalCalories.add(ex.getCaloriesPerSet().multiply(BigDecimal.valueOf(ex.getTargetSets())));
            }
            dp.setTotalCalories(totalCalories);
            dp.setTotalDuration(q.getTrainingDurationPerSession());
            dailyPlanMapper.updateById(dp);
        }

        for (int d = 1; d <= 7; d++) {
            LocalDate date = weekStart.plusDays(d - 1);
            if (!trainingDays.contains(date)) {
                DailyPlan restDay = new DailyPlan();
                restDay.setWeeklyPlanId(wp.getId());
                restDay.setPlanDate(date);
                restDay.setDayOfWeek(d);
                restDay.setIsRestDay(1);
                restDay.setTrainingFocus(Constants.FOCUS_REST);
                restDay.setTotalDuration(0);
                restDay.setTotalCalories(BigDecimal.ZERO);
                restDay.setStatus(0);
                dailyPlanMapper.insert(restDay);
            }
        }

        return buildWeeklyPlanVO(wp);
    }

    private void deleteWeeklyPlan(WeeklyPlan wp) {
        QueryWrapper<DailyPlan> dpWrapper = new QueryWrapper<>();
        dpWrapper.eq("weekly_plan_id", wp.getId());
        List<DailyPlan> dps = dailyPlanMapper.selectList(dpWrapper);
        for (DailyPlan dp : dps) {
            QueryWrapper<DailyPlanExercise> dpeWrapper = new QueryWrapper<>();
            dpeWrapper.eq("daily_plan_id", dp.getId());
            dailyPlanExerciseMapper.delete(dpeWrapper);
        }
        dailyPlanMapper.delete(dpWrapper);
        weeklyPlanMapper.deleteById(wp.getId());
    }

    private List<LocalDate> selectTrainingDays(LocalDate weekStart, int trainingDays) {
        List<LocalDate> days = new ArrayList<>();
        int[] defaultSchedule3 = {1, 3, 5};
        int[] defaultSchedule4 = {1, 2, 4, 5};
        int[] defaultSchedule5 = {1, 2, 3, 5, 6};
        int[] defaultSchedule6 = {1, 2, 3, 4, 5, 6};
        int[] schedule;
        switch (trainingDays) {
            case 3: schedule = defaultSchedule3; break;
            case 4: schedule = defaultSchedule4; break;
            case 5: schedule = defaultSchedule5; break;
            case 6: schedule = defaultSchedule6; break;
            default: schedule = defaultSchedule3; break;
        }
        for (int day : schedule) {
            days.add(weekStart.plusDays(day - 1));
        }
        return days;
    }

    private List<String> generateFocusList(int goal, int trainingDays) {
        List<String> list = new ArrayList<>();
        if (goal == Constants.GOAL_MUSCLE) {
            switch (trainingDays) {
                case 3:
                    list.add(Constants.FOCUS_FULL_BODY);
                    list.add(Constants.FOCUS_PUSH);
                    list.add(Constants.FOCUS_PULL);
                    break;
                case 4:
                    list.add(Constants.FOCUS_CHEST);
                    list.add(Constants.FOCUS_BACK);
                    list.add(Constants.FOCUS_SHOULDER);
                    list.add(Constants.FOCUS_LEG);
                    break;
                case 5:
                    list.add(Constants.FOCUS_CHEST);
                    list.add(Constants.FOCUS_BACK);
                    list.add(Constants.FOCUS_LEG);
                    list.add(Constants.FOCUS_SHOULDER);
                    list.add(Constants.FOCUS_ARM);
                    break;
                case 6:
                    list.add(Constants.FOCUS_CHEST);
                    list.add(Constants.FOCUS_BACK);
                    list.add(Constants.FOCUS_LEG);
                    list.add(Constants.FOCUS_SHOULDER);
                    list.add(Constants.FOCUS_ARM);
                    list.add(Constants.FOCUS_FULL_BODY);
                    break;
                default:
                    list.add(Constants.FOCUS_FULL_BODY);
                    list.add(Constants.FOCUS_PUSH);
                    list.add(Constants.FOCUS_PULL);
            }
        } else {
            switch (trainingDays) {
                case 3:
                    list.add(Constants.FOCUS_HIIT);
                    list.add(Constants.FOCUS_FULL_BODY);
                    list.add(Constants.FOCUS_HIIT);
                    break;
                case 4:
                    list.add(Constants.FOCUS_FULL_BODY);
                    list.add(Constants.FOCUS_HIIT);
                    list.add(Constants.FOCUS_FULL_BODY);
                    list.add(Constants.FOCUS_HIIT);
                    break;
                case 5:
                    list.add(Constants.FOCUS_CHEST);
                    list.add(Constants.FOCUS_BACK);
                    list.add(Constants.FOCUS_LEG);
                    list.add(Constants.FOCUS_HIIT);
                    list.add(Constants.FOCUS_FULL_BODY);
                    break;
                case 6:
                    list.add(Constants.FOCUS_CHEST);
                    list.add(Constants.FOCUS_BACK);
                    list.add(Constants.FOCUS_LEG);
                    list.add(Constants.FOCUS_SHOULDER);
                    list.add(Constants.FOCUS_HIIT);
                    list.add(Constants.FOCUS_FULL_BODY);
                    break;
                default:
                    list.add(Constants.FOCUS_HIIT);
                    list.add(Constants.FOCUS_FULL_BODY);
                    list.add(Constants.FOCUS_HIIT);
            }
        }
        return list;
    }

    private DailyPlan createDailyPlan(Long weeklyPlanId, LocalDate date, String focus, Questionnaire q) {
        DailyPlan dp = new DailyPlan();
        dp.setWeeklyPlanId(weeklyPlanId);
        dp.setPlanDate(date);
        dp.setDayOfWeek(date.getDayOfWeek().getValue());
        dp.setIsRestDay(0);
        dp.setTrainingFocus(focus);
        dp.setTotalDuration(q.getTrainingDurationPerSession());
        dp.setTotalCalories(BigDecimal.ZERO);
        dp.setStatus(0);
        return dp;
    }

    private List<Exercise> selectExercisesForFocus(String focus, String goal, int fitnessLevel) {
        List<Exercise> result = new ArrayList<>();
        List<Exercise> pool;

        switch (focus) {
            case "推":
            case "胸":
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CHEST, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 3);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_SHOULDER, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_ARM, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                break;
            case "拉":
            case "背":
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_BACK, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 4);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_ARM, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                break;
            case "腿":
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_LEG, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 5);
                break;
            case "肩":
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_SHOULDER, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 4);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_ARM, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                break;
            case "臂":
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_ARM, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 5);
                break;
            case "全身":
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CHEST, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_BACK, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_LEG, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 2);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_SHOULDER, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CORE, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 1);
                break;
            case "HIIT":
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CARDIO, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 4);
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CORE, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 2);
                break;
            default:
                pool = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CHEST, goal);
                addExercisesByDifficulty(result, pool, fitnessLevel, 4);
        }
        return result;
    }

    private void addExercisesByDifficulty(List<Exercise> result, List<Exercise> pool, int fitnessLevel, int count) {
        if (pool == null || pool.isEmpty()) return;

        List<Exercise> filtered = pool.stream()
                .filter(e -> e.getDifficulty() <= fitnessLevel + 1)
                .collect(Collectors.toList());
        if (filtered.isEmpty()) {
            filtered = new ArrayList<>(pool);
        }

        Collections.shuffle(filtered);
        int toAdd = Math.min(count, filtered.size());
        for (int i = 0; i < toAdd; i++) {
            result.add(filtered.get(i));
        }
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

        List<DailyPlanVO> dpVOList = new ArrayList<>();
        for (DailyPlan dp : dps) {
            DailyPlanVO dpVO = buildDailyPlanVO(dp);
            dpVOList.add(dpVO);
        }
        vo.setDailyPlans(dpVOList);

        return vo;
    }

    private DailyPlanVO buildDailyPlanVO(DailyPlan dp) {
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
            Exercise ex = getExerciseById(dpe.getExerciseId());
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

    private Map<Long, Exercise> exerciseCache = new HashMap<>();

    private Exercise getExerciseById(Long id) {
        if (exerciseCache.containsKey(id)) {
            return exerciseCache.get(id);
        }
        Exercise ex = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CHEST, Constants.SUITABLE_ALL).stream()
                .filter(e -> e.getId().equals(id))
                .findFirst().orElse(null);
        if (ex == null) {
            ex = exerciseService.selectExercisesForPlan(Constants.CATEGORY_BACK, Constants.SUITABLE_ALL).stream()
                    .filter(e -> e.getId().equals(id))
                    .findFirst().orElse(null);
        }
        if (ex == null) {
            ex = exerciseService.selectExercisesForPlan(Constants.CATEGORY_LEG, Constants.SUITABLE_ALL).stream()
                    .filter(e -> e.getId().equals(id))
                    .findFirst().orElse(null);
        }
        if (ex == null) {
            ex = exerciseService.selectExercisesForPlan(Constants.CATEGORY_SHOULDER, Constants.SUITABLE_ALL).stream()
                    .filter(e -> e.getId().equals(id))
                    .findFirst().orElse(null);
        }
        if (ex == null) {
            ex = exerciseService.selectExercisesForPlan(Constants.CATEGORY_ARM, Constants.SUITABLE_ALL).stream()
                    .filter(e -> e.getId().equals(id))
                    .findFirst().orElse(null);
        }
        if (ex == null) {
            ex = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CORE, Constants.SUITABLE_ALL).stream()
                    .filter(e -> e.getId().equals(id))
                    .findFirst().orElse(null);
        }
        if (ex == null) {
            ex = exerciseService.selectExercisesForPlan(Constants.CATEGORY_CARDIO, Constants.SUITABLE_ALL).stream()
                    .filter(e -> e.getId().equals(id))
                    .findFirst().orElse(null);
        }
        if (ex != null) {
            exerciseCache.put(id, ex);
        }
        return ex;
    }
}
