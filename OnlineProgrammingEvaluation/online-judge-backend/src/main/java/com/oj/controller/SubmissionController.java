package com.oj.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.oj.common.Result;
import com.oj.dto.SubmitDTO;
import com.oj.entity.Submission;
import com.oj.service.SubmissionService;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/submission")
public class SubmissionController {

    @Resource
    private SubmissionService submissionService;

    @PostMapping("/submit")
    public Result<Submission> submit(@Valid @RequestBody SubmitDTO submitDTO, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        return Result.success(submissionService.submit(submitDTO, userId));
    }

    @GetMapping("/list")
    public Result<IPage<Submission>> getSubmissionList(@RequestParam(defaultValue = "1") int page,
                                                       @RequestParam(defaultValue = "10") int size,
                                                       @RequestParam(required = false) Long userId,
                                                       @RequestParam(required = false) Long problemId,
                                                       @RequestParam(required = false) Long contestId,
                                                       @RequestParam(required = false) Integer status,
                                                       @RequestParam(required = false) String language) {
        return Result.success(submissionService.getSubmissionPage(page, size, userId, problemId, contestId, status, language));
    }

    @GetMapping("/detail/{id}")
    public Result<Submission> getSubmissionDetail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        return Result.success(submissionService.getSubmissionDetail(id, userId));
    }

    @GetMapping("/mine")
    public Result<IPage<Submission>> getMySubmissions(@RequestParam(defaultValue = "1") int page,
                                                      @RequestParam(defaultValue = "10") int size,
                                                      @RequestParam(required = false) Long problemId,
                                                      @RequestParam(required = false) Integer status,
                                                      HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        return Result.success(submissionService.getSubmissionPage(page, size, userId, problemId, null, status, null));
    }
}
