package com.survey.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.survey.common.JwtTokenUtil;
import com.survey.common.Result;
import com.survey.dto.AnswerSubmitDTO;
import com.survey.dto.SurveyStatisticsVO;
import com.survey.entity.SurveyResponse;
import com.survey.service.AnswerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api")
public class AnswerController {

    private final AnswerService answerService;
    private final JwtTokenUtil jwtTokenUtil;

    public AnswerController(AnswerService answerService, JwtTokenUtil jwtTokenUtil) {
        this.answerService = answerService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/answers/submit")
    public Result<Void> submit(@Valid @RequestBody AnswerSubmitDTO dto,
                               HttpServletRequest request) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        Long userId = getUserIdOptional(request);
        answerService.submitAnswer(dto, ip, userAgent, userId);
        return Result.success();
    }

    @GetMapping("/surveys/{surveyId}/responses")
    public Result<IPage<SurveyResponse>> getResponses(@PathVariable Long surveyId,
                                                      @RequestParam(defaultValue = "1") int current,
                                                      @RequestParam(defaultValue = "10") int size,
                                                      HttpServletRequest request) {
        getUserId(request);
        return Result.success(answerService.getResponses(surveyId, current, size));
    }

    @GetMapping("/surveys/{surveyId}/statistics")
    public Result<SurveyStatisticsVO> getStatistics(@PathVariable Long surveyId,
                                                    HttpServletRequest request) {
        getUserId(request);
        return Result.success(answerService.getStatistics(surveyId));
    }

    @GetMapping("/surveys/{surveyId}/export")
    public void export(@PathVariable Long surveyId,
                       HttpServletRequest request,
                       HttpServletResponse response) throws Exception {
        getUserId(request);
        byte[] bytes = answerService.exportExcel(surveyId);
        String filename = URLEncoder.encode("survey_" + surveyId + ".xlsx", StandardCharsets.UTF_8.name())
                .replaceAll("\\+", "%20");
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + filename);
        response.setContentLength(bytes.length);
        try (OutputStream out = response.getOutputStream()) {
            out.write(bytes);
            out.flush();
        }
    }

    private Long getUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring("Bearer ".length());
        return jwtTokenUtil.getUserIdFromToken(token);
    }

    private Long getUserIdOptional(HttpServletRequest request) {
        try {
            return getUserId(request);
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
