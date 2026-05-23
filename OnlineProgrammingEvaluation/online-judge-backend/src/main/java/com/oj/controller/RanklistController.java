package com.oj.controller;

import com.oj.common.Result;
import com.oj.service.RanklistService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ranklist")
public class RanklistController {

    @Resource
    private RanklistService ranklistService;

    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getRanklist(@RequestParam(defaultValue = "1") int page,
                                                         @RequestParam(defaultValue = "20") int size) {
        return Result.success(ranklistService.getRanklist(page, size));
    }

    @GetMapping("/size")
    public Result<Long> getRanklistSize() {
        return Result.success(ranklistService.getRanklistSize());
    }

    @PostMapping("/refresh")
    public Result<String> refreshRanklist() {
        ranklistService.refreshRanklist();
        return Result.success("刷新成功");
    }
}
