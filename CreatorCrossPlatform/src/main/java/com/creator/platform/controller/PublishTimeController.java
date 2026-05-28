package com.creator.platform.controller;

import com.creator.platform.common.Result;
import com.creator.platform.service.PublishTimeAnalysisService;
import com.creator.platform.vo.PublishTimeAnalysisVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/publish-time")
@RequiredArgsConstructor
public class PublishTimeController {

    private final PublishTimeAnalysisService publishTimeAnalysisService;

    @GetMapping("/analysis")
    public Result<PublishTimeAnalysisVO> getPublishTimeAnalysis(
            @RequestParam Long creatorId,
            @RequestParam(required = false) Long platformId) {
        return Result.success(publishTimeAnalysisService.getPublishTimeAnalysis(creatorId, platformId));
    }

    @PostMapping("/generate")
    public Result<Void> generateAnalysis(@RequestParam Long creatorId) {
        publishTimeAnalysisService.generatePublishTimeAnalysis(creatorId);
        return Result.success();
    }

    @GetMapping("/refresh")
    public Result<Void> refreshCache(@RequestParam Long creatorId) {
        publishTimeAnalysisService.evictCache(creatorId);
        return Result.success();
    }
}
