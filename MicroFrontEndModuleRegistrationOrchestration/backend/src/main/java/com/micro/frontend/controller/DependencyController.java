package com.micro.frontend.controller;

import com.micro.frontend.annotation.Audit;
import com.micro.frontend.common.Result;
import com.micro.frontend.entity.AppDependency;
import com.micro.frontend.service.IDependencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dependency")
public class DependencyController {

    @Autowired
    private IDependencyService dependencyService;

    @GetMapping("/{id}")
    public Result<AppDependency> getById(@PathVariable Long id) {
        return Result.success(dependencyService.getById(id));
    }

    @GetMapping("/app/{appId}")
    public Result<List<AppDependency>> getByAppId(@PathVariable Long appId) {
        return Result.success(dependencyService.getByAppId(appId));
    }

    @GetMapping("/version/{appVersionId}")
    public Result<List<AppDependency>> getByAppVersionId(@PathVariable Long appVersionId) {
        return Result.success(dependencyService.getByAppVersionId(appVersionId));
    }

    @GetMapping("/code/{dependencyCode}")
    public Result<List<AppDependency>> getByDependencyCode(@PathVariable String dependencyCode) {
        return Result.success(dependencyService.getByDependencyCode(dependencyCode));
    }

    @PostMapping
    @Audit(operationType = "CREATE", module = "APP", targetTable = "app_dependency", description = "新增依赖配置")
    public Result<Void> save(@RequestBody AppDependency dependency) {
        dependencyService.save(dependency);
        return Result.success();
    }

    @PutMapping
    @Audit(operationType = "UPDATE", module = "APP", targetTable = "app_dependency", description = "更新依赖配置")
    public Result<Void> update(@RequestBody AppDependency dependency) {
        dependencyService.update(dependency);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Audit(operationType = "DELETE", module = "APP", targetTable = "app_dependency", description = "删除依赖配置")
    public Result<Void> delete(@PathVariable Long id) {
        dependencyService.delete(id);
        return Result.success();
    }

    @DeleteMapping("/version/{appVersionId}")
    @Audit(operationType = "DELETE", module = "APP", targetTable = "app_dependency", description = "删除版本依赖配置")
    public Result<Void> deleteByAppVersionId(@PathVariable Long appVersionId) {
        dependencyService.deleteByAppVersionId(appVersionId);
        return Result.success();
    }

    @GetMapping("/validate/{appVersionId}")
    public Result<Map<String, Object>> validate(@PathVariable Long appVersionId) {
        return Result.success(dependencyService.validate(appVersionId));
    }

    @GetMapping("/validate/all/{appId}")
    public Result<Map<String, Object>> validateAllDependencies(@PathVariable Long appId) {
        return Result.success(dependencyService.validateAllDependencies(appId));
    }
}
