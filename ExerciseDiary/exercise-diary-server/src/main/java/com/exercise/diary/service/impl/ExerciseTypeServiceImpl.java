package com.exercise.diary.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.exercise.diary.entity.ExerciseType;
import com.exercise.diary.mapper.ExerciseTypeMapper;
import com.exercise.diary.service.ExerciseTypeService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExerciseTypeServiceImpl extends ServiceImpl<ExerciseTypeMapper, ExerciseType> implements ExerciseTypeService {

    @Override
    public List<ExerciseType> getAllTypes() {
        return baseMapper.selectAllOrdered();
    }

}
