package com.example.resume.controller;

import com.example.resume.common.Result;
import com.example.resume.entity.VisitLog;
import com.example.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/visit-logs")
@RequiredArgsConstructor
public class VisitLogController {
    private final ResumeService resumeService;

    @GetMapping("/resume/{resumeId}")
    public Result<List<VisitLog>> getVisitLogs(@PathVariable Long resumeId) {
        return Result.success(resumeService.getVisitLogs(resumeId));
    }

    @PostMapping("/resume/{resumeId}/count")
    public Result<Long> getVisitCount(@PathVariable Long resumeId, @RequestBody Map<String, String> request) {
        LocalDateTime start = LocalDateTime.parse(request.get("start"));
        LocalDateTime end = LocalDateTime.parse(request.get("end"));
        Long count = resumeService.getVisitCount(resumeId, start, end);
        return Result.success(count);
    }
}
