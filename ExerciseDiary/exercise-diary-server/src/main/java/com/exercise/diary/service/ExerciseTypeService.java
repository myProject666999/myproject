package com.exercise.diary.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.exercise.diary.entity.ExerciseType;

import java.util.List;

public interface ExerciseTypeService extends IService<ExerciseType> {

    List<ExerciseType> getAllTypes();

}
