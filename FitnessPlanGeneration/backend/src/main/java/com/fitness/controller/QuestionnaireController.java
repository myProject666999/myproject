package com.fitness.controller;

import com.fitness.common.Result;
import com.fitness.dto.QuestionnaireDTO;
import com.fitness.entity.Questionnaire;
import com.fitness.service.QuestionnaireService;
import com.fitness.vo.WeeklyPlanVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/questionnaire")
public class QuestionnaireController {

    @Autowired
    private QuestionnaireService questionnaireService;

    @PostMapping("/save")
    public Result<Questionnaire> save(@Valid @RequestBody QuestionnaireDTO dto) {
        try {
            Questionnaire q = questionnaireService.save(dto);
            return Result.success(q);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public Result<Questionnaire> getByUserId(@PathVariable Long userId) {
        return Result.success(questionnaireService.getByUserId(userId));
    }

    @PostMapping("/generate/{questionnaireId}")
    public Result<WeeklyPlanVO> generateWeeklyPlan(@PathVariable Long questionnaireId) {
        try {
            WeeklyPlanVO vo = questionnaireService.generateWeeklyPlan(questionnaireId);
            return Result.success(vo);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
