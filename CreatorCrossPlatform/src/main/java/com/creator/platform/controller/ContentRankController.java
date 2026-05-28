package com.creator.platform.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.creator.platform.common.Result;
import com.creator.platform.service.ContentRankService;
import com.creator.platform.vo.ContentRankVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/content")
@RequiredArgsConstructor
public class ContentRankController {

    private final ContentRankService contentRankService;

    @GetMapping("/rank")
    public Result<Page<ContentRankVO>> getContentRank(
            @RequestParam Long creatorId,
            @RequestParam(required = false) Long platformId,
            @RequestParam(required = false, defaultValue = "hotValue") String sortBy,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return Result.success(contentRankService.getContentRank(creatorId, platformId, sortBy, pageNum, pageSize));
    }

    @GetMapping("/top")
    public Result<List<ContentRankVO>> getTopContents(
            @RequestParam Long creatorId,
            @RequestParam(required = false) Long platformId,
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "hotValue") String sortBy) {
        return Result.success(contentRankService.getTopContents(creatorId, platformId, limit, sortBy));
    }

    @GetMapping("/refresh")
    public Result<Void> refreshCache(@RequestParam Long creatorId) {
        contentRankService.evictCache(creatorId);
        return Result.success();
    }
}
