package com.fitness.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fitness.entity.Exercise;
import com.fitness.mapper.ExerciseMapper;
import com.fitness.service.ExerciseService;
import com.fitness.vo.ExerciseVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExerciseServiceImpl implements ExerciseService {

    @Autowired
    private ExerciseMapper exerciseMapper;

    @Override
    public List<ExerciseVO> listAll() {
        return exerciseMapper.selectList(null).stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseVO> listByCategory(String category) {
        QueryWrapper<Exercise> wrapper = new QueryWrapper<>();
        wrapper.eq("category", category);
        return exerciseMapper.selectList(wrapper).stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    @Override
    public ExerciseVO getById(Long id) {
        Exercise exercise = exerciseMapper.selectById(id);
        return exercise != null ? toVO(exercise) : null;
    }

    @Override
    public List<Exercise> selectExercisesForPlan(String category, String goal) {
        return exerciseMapper.selectByCategoryAndGoal(category, goal);
    }

    private ExerciseVO toVO(Exercise e) {
        ExerciseVO vo = new ExerciseVO();
        vo.setId(e.getId());
        vo.setName(e.getName());
        vo.setCategory(e.getCategory());
        vo.setMuscleGroup(e.getMuscleGroup());
        vo.setDifficulty(e.getDifficulty());
        vo.setEquipment(e.getEquipment());
        vo.setDescription(e.getDescription());
        vo.setTargetRepsMin(e.getTargetRepsMin());
        vo.setTargetRepsMax(e.getTargetRepsMax());
        vo.setTargetSets(e.getTargetSets());
        vo.setRestSeconds(e.getRestSeconds());
        vo.setCaloriesPerSet(e.getCaloriesPerSet());
        vo.setSuitableForGoal(e.getSuitableForGoal());
        vo.setVideoUrl(e.getVideoUrl());
        vo.setImageUrl(e.getImageUrl());
        return vo;
    }
}
