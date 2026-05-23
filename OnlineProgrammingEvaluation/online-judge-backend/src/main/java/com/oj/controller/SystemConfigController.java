package com.oj.controller;

import com.oj.common.Result;
import com.oj.entity.SystemConfig;
import com.oj.service.SystemConfigService;
import jakarta.annotation.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/config")
public class SystemConfigController {

    @Resource
    private SystemConfigService systemConfigService;

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<SystemConfig>> getConfigList() {
        return Result.success(systemConfigService.getAllConfigs());
    }

    @GetMapping("/detail/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<SystemConfig> getConfig(@PathVariable String key) {
        return Result.success(systemConfigService.getConfig(key));
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> updateConfig(@RequestBody SystemConfig config) {
        systemConfigService.updateConfig(config);
        return Result.success("更新成功");
    }
}
