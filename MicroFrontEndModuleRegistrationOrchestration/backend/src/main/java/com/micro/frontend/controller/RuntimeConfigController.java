package com.micro.frontend.controller;

import com.micro.frontend.annotation.Audit;
import com.micro.frontend.common.PageResult;
import com.micro.frontend.common.Result;
import com.micro.frontend.dto.ConfigPublishDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.RuntimeConfig;
import com.micro.frontend.service.IRuntimeConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class RuntimeConfigController {

    @Autowired
    private IRuntimeConfigService runtimeConfigService;

    @GetMapping("/{id}")
    public Result<RuntimeConfig> getById(@PathVariable Long id) {
        return Result.success(runtimeConfigService.getById(id));
    }

    @GetMapping("/key")
    public Result<RuntimeConfig> getByKeyAndAppCode(
            @RequestParam String configKey,
            @RequestParam(required = false) String appCode) {
        return Result.success(runtimeConfigService.getByKeyAndAppCode(configKey, appCode));
    }

    @GetMapping("/page")
    public Result<PageResult<RuntimeConfig>> page(PageQueryDTO query) {
        return Result.success(runtimeConfigService.page(query));
    }

    @GetMapping("/list")
    public Result<List<RuntimeConfig>> list(PageQueryDTO query) {
        return Result.success(runtimeConfigService.list(query));
    }

    @PostMapping
    @Audit(operationType = "CREATE", module = "CONFIG", targetTable = "runtime_config", description = "新增运行时配置")
    public Result<Void> save(@RequestBody RuntimeConfig config) {
        runtimeConfigService.save(config);
        return Result.success();
    }

    @PutMapping
    @Audit(operationType = "UPDATE", module = "CONFIG", targetTable = "runtime_config", description = "更新运行时配置")
    public Result<Void> update(@RequestBody RuntimeConfig config) {
        runtimeConfigService.update(config);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Audit(operationType = "DELETE", module = "CONFIG", targetTable = "runtime_config", description = "删除运行时配置")
    public Result<Void> delete(@PathVariable Long id) {
        runtimeConfigService.delete(id);
        return Result.success();
    }

    @PostMapping("/status/{id}")
    @Audit(operationType = "UPDATE", module = "CONFIG", targetTable = "runtime_config", description = "更新配置状态")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Integer> params) {
        Integer status = params.get("status");
        runtimeConfigService.updateStatus(id, status);
        return Result.success();
    }

    @GetMapping("/app/{appId}")
    public Result<List<RuntimeConfig>> getByAppId(@PathVariable Long appId) {
        return Result.success(runtimeConfigService.getByAppId(appId));
    }

    @GetMapping("/global")
    public Result<List<RuntimeConfig>> getGlobalConfigs() {
        return Result.success(runtimeConfigService.getGlobalConfigs());
    }

    @GetMapping("/all")
    public Result<Map<String, Object>> getAllActiveConfigs() {
        return Result.success(runtimeConfigService.getAllActiveConfigs());
    }

    @PostMapping("/publish")
    @Audit(operationType = "PUBLISH", module = "CONFIG", targetTable = "config_publish", description = "发布配置")
    public Result<Void> publish(@RequestBody @Validated ConfigPublishDTO dto) {
        runtimeConfigService.publish(dto);
        return Result.success();
    }

    @PostMapping("/sync")
    @Audit(operationType = "UPDATE", module = "CONFIG", description = "同步配置缓存")
    public Result<Void> syncCache() {
        runtimeConfigService.syncCache();
        return Result.success();
    }
}
