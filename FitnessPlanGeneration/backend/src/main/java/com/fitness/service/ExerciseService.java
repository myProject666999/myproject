package com.fitness.service;

import com.fitness.entity.Exercise;
import com.fitness.vo.ExerciseVO;
import java.util.List;

public interface ExerciseService {
    List<ExerciseVO> listAll();
    List<ExerciseVO> listByCategory(String category);
    ExerciseVO getById(Long id);
    List<Exercise> selectExercisesForPlan(String category, String goal);
}
