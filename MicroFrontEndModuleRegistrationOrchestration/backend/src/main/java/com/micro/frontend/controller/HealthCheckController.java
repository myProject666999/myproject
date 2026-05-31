package com.micro.frontend.controller;

import com.micro.frontend.annotation.Audit;
import com.micro.frontend.common.PageResult;
import com.micro.frontend.common.Result;
import com.micro.frontend.dto.HealthCheckResultDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.HealthCheck;
import com.micro.frontend.entity.HealthCheckHistory;
import com.micro.frontend.service.IHealthCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private IHealthCheckService healthCheckService;

    @GetMapping("/{id}")
    public Result<HealthCheck> getById(@PathVariable Long id) {
        return Result.success(healthCheckService.getById(id));
    }

    @GetMapping("/app/{appId}")
    public Result<HealthCheck> getByAppId(@PathVariable Long appId) {
        return Result.success(healthCheckService.getByAppId(appId));
    }

    @GetMapping("/list")
    public Result<List<HealthCheck>> list() {
        return Result.success(healthCheckService.list());
    }

    @GetMapping("/page")
    public Result<PageResult<HealthCheckHistory>> getHistory(PageQueryDTO query) {
        return Result.success(healthCheckService.getHistory(query));
    }

    @GetMapping("/history/{appId}")
    public Result<List<HealthCheckHistory>> getHistoryByAppId(@PathVariable Long appId) {
        return Result.success(healthCheckService.getHistoryByAppId(appId));
    }

    @PostMapping
    @Audit(operationType = "CREATE", module = "HEALTH", targetTable = "health_check", description = "新增健康检查配置")
    public Result<Void> save(@RequestBody HealthCheck healthCheck) {
        healthCheckService.save(healthCheck);
        return Result.success();
    }

    @PutMapping
    @Audit(operationType = "UPDATE", module = "HEALTH", targetTable = "health_check", description = "更新健康检查配置")
    public Result<Void> update(@RequestBody HealthCheck healthCheck) {
        healthCheckService.update(healthCheck);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Audit(operationType = "DELETE", module = "HEALTH", targetTable = "health_check", description = "删除健康检查配置")
    public Result<Void> delete(@PathVariable Long id) {
        healthCheckService.delete(id);
        return Result.success();
    }

    @PostMapping("/status/{id}")
    @Audit(operationType = "UPDATE", module = "HEALTH", targetTable = "health_check", description = "更新健康检查状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer status = params.get("status");
        healthCheckService.updateStatus(id, status);
        return Result.success();
    }

    @PostMapping("/check/{id}")
    @Audit(operationType = "UPDATE", module = "HEALTH", description = "执行健康检查")
    public Result<HealthCheckResultDTO> check(@PathVariable Long id) {
        return Result.success(healthCheckService.check(id));
    }

    @PostMapping("/check")
    @Audit(operationType = "UPDATE", module = "HEALTH", description = "执行全部健康检查")
    public Result<List<HealthCheckResultDTO>> checkAll() {
        return Result.success(healthCheckService.checkAll());
    }
}
