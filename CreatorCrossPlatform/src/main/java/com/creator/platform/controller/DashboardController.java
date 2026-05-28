package com.creator.platform.controller;

import com.creator.platform.common.Result;
import com.creator.platform.service.DashboardService;
import com.creator.platform.vo.DashboardOverviewVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public Result<DashboardOverviewVO> getOverview(@RequestParam Long creatorId) {
        return Result.success(dashboardService.getDashboardOverview(creatorId));
    }

    @GetMapping("/refresh")
    public Result<Void> refreshCache(@RequestParam Long creatorId) {
        dashboardService.evictCache(creatorId);
        return Result.success();
    }
}
