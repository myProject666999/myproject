package com.survey.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.survey.common.JwtTokenUtil;
import com.survey.common.Result;
import com.survey.dto.SurveyCreateDTO;
import com.survey.dto.SurveyPublishDTO;
import com.survey.dto.SurveyUpdateDTO;
import com.survey.dto.SurveyVO;
import com.survey.entity.Survey;
import com.survey.service.SurveyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    private final SurveyService surveyService;
    private final JwtTokenUtil jwtTokenUtil;

    public SurveyController(SurveyService surveyService, JwtTokenUtil jwtTokenUtil) {
        this.surveyService = surveyService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @GetMapping
    public Result<IPage<SurveyVO>> list(HttpServletRequest request,
                                        @RequestParam(required = false) Integer status,
                                        @RequestParam(defaultValue = "1") int current,
                                        @RequestParam(defaultValue = "10") int size) {
        Long userId = getUserId(request);
        return Result.success(surveyService.list(userId, status, current, size));
    }

    @GetMapping("/{id}")
    public Result<Survey> getById(@PathVariable Long id) {
        return Result.success(surveyService.getById(id));
    }

    @PostMapping
    public Result<Survey> create(@Valid @RequestBody SurveyCreateDTO dto,
                                 HttpServletRequest request) {
        Long userId = getUserId(request);
        return Result.success(surveyService.create(dto, userId));
    }

    @PutMapping("/{id}")
    public Result<Survey> update(@PathVariable Long id,
                                 @Valid @RequestBody SurveyUpdateDTO dto,
                                 HttpServletRequest request) {
        dto.setId(id);
        Long userId = getUserId(request);
        return Result.success(surveyService.update(dto, userId));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserId(request);
        surveyService.delete(id, userId);
        return Result.success();
    }

    @PostMapping("/{id}/publish")
    public Result<Survey> publish(@PathVariable Long id,
                                  @Valid @RequestBody(required = false) SurveyPublishDTO dto,
                                  HttpServletRequest request) {
        if (dto == null) {
            dto = new SurveyPublishDTO();
        }
        dto.setSurveyId(id);
        if (dto.getStatus() == null) {
            dto.setStatus(1);
        }
        Long userId = getUserId(request);
        return Result.success(surveyService.publish(dto, userId));
    }

    @GetMapping("/public/{id}")
    public Result<Survey> getPublished(@PathVariable Long id) {
        surveyService.incrementViewCount(id);
        return Result.success(surveyService.getPublishedById(id));
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
