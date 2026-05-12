
package com.beautyhair.controller;

import com.beautyhair.common.Result;
import com.beautyhair.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/data")
    public Result<Map<String, Object>> getDashboardData() {
        Map<String, Object> data = dashboardService.getDashboardData();
        return Result.success(data);
    }
}
