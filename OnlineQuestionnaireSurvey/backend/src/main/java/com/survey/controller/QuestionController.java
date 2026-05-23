package com.survey.controller;

import com.survey.common.JwtTokenUtil;
import com.survey.common.Result;
import com.survey.dto.QuestionDTO;
import com.survey.dto.QuestionVO;
import com.survey.service.QuestionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys/{surveyId}/questions")
public class QuestionController {

    private final QuestionService questionService;
    private final JwtTokenUtil jwtTokenUtil;

    public QuestionController(QuestionService questionService, JwtTokenUtil jwtTokenUtil) {
        this.questionService = questionService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @GetMapping
    public Result<List<QuestionVO>> getBySurveyId(@PathVariable Long surveyId) {
        return Result.success(questionService.getBySurveyId(surveyId));
    }

    @PostMapping
    public Result<Void> saveQuestions(@PathVariable Long surveyId,
                                      @Valid @RequestBody List<QuestionDTO> questions,
                                      HttpServletRequest request) {
        getUserId(request);
        questionService.saveQuestions(surveyId, questions);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long surveyId,
                               @PathVariable Long id,
                               HttpServletRequest request) {
        getUserId(request);
        questionService.deleteQuestion(id, surveyId);
        return Result.success();
    }

    private Long getUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring("Bearer ".length());
        return jwtTokenUtil.getUserIdFromToken(token);
    }
}
