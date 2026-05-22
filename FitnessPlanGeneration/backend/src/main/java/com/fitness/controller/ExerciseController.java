package com.fitness.controller;

import com.fitness.common.Result;
import com.fitness.service.ExerciseService;
import com.fitness.vo.ExerciseVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exercise")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @GetMapping("/list")
    public Result<List<ExerciseVO>> listAll() {
        return Result.success(exerciseService.listAll());
    }

    @GetMapping("/category/{category}")
    public Result<List<ExerciseVO>> listByCategory(@PathVariable String category) {
        return Result.success(exerciseService.listByCategory(category));
    }

    @GetMapping("/{id}")
    public Result<ExerciseVO> getById(@PathVariable Long id) {
        ExerciseVO vo = exerciseService.getById(id);
        if (vo == null) {
            return Result.error("动作不存在");
        }
        return Result.success(vo);
    }
}
