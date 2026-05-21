package com.exercise.diary.controller;

import com.exercise.diary.common.Result;
import com.exercise.diary.entity.ExerciseType;
import com.exercise.diary.service.ExerciseTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/type")
@CrossOrigin
public class ExerciseTypeController {

    @Autowired
    private ExerciseTypeService exerciseTypeService;

    @GetMapping("/list")
    public Result<List<ExerciseType>> getAllTypes() {
        return Result.success(exerciseTypeService.getAllTypes());
    }

}
