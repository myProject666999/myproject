package com.micro.frontend.controller;

import com.micro.frontend.annotation.Audit;
import com.micro.frontend.common.PageResult;
import com.micro.frontend.common.Result;
import com.micro.frontend.dto.AppRegisterDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.dto.VersionPublishDTO;
import com.micro.frontend.entity.AppVersion;
import com.micro.frontend.entity.MicroApp;
import com.micro.frontend.service.IMicroAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app")
public class MicroAppController {

    @Autowired
    private IMicroAppService microAppService;

    @GetMapping("/{id}")
    public Result<MicroApp> getById(@PathVariable Long id) {
        return Result.success(microAppService.getById(id));
    }

    @GetMapping("/code/{appCode}")
    public Result<MicroApp> getByAppCode(@PathVariable String appCode) {
        return Result.success(microAppService.getByAppCode(appCode));
    }

    @GetMapping("/page")
    public Result<PageResult<MicroApp>> page(PageQueryDTO query) {
        return Result.success(microAppService.page(query));
    }

    @GetMapping("/list")
    public Result<List<MicroApp>> list(PageQueryDTO query) {
        return Result.success(microAppService.list(query));
    }

    @PostMapping
    @Audit(operationType = "CREATE", module = "APP", targetTable = "micro_app", description = "注册微应用")
    public Result<Void> register(@RequestBody @Validated AppRegisterDTO dto) {
        microAppService.register(dto);
        return Result.success();
    }

    @PutMapping
    @Audit(operationType = "UPDATE", module = "APP", targetTable = "micro_app", description = "更新微应用")
    public Result<Void> update(@RequestBody @Validated AppRegisterDTO dto) {
        microAppService.update(dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Audit(operationType = "DELETE", module = "APP", targetTable = "micro_app", description = "删除微应用")
    public Result<Void> delete(@PathVariable Long id) {
        microAppService.delete(id);
        return Result.success();
    }

    @PostMapping("/offline/{id}")
    @Audit(operationType = "UPDATE", module = "APP", targetTable = "micro_app", description = "下线微应用")
    public Result<Void> offline(@PathVariable Long id) {
        microAppService.offline(id);
        return Result.success();
    }

    @PostMapping("/online/{id}")
    @Audit(operationType = "UPDATE", module = "APP", targetTable = "micro_app", description = "上线微应用")
    public Result<Void> online(@PathVariable Long id) {
        microAppService.online(id);
        return Result.success();
    }

    @PostMapping("/version")
    @Audit(operationType = "PUBLISH", module = "APP", targetTable = "app_version", description = "发布应用版本")
    public Result<Void> publishVersion(@RequestBody @Validated VersionPublishDTO dto) {
        microAppService.publishVersion(dto);
        return Result.success();
    }

    @GetMapping("/version/list/{appId}")
    public Result<List<AppVersion>> getVersionList(@PathVariable Long appId) {
        return Result.success(microAppService.getVersionList(appId));
    }

    @GetMapping("/version/active/{appId}")
    public Result<AppVersion> getActiveVersion(@PathVariable Long appId) {
        return Result.success(microAppService.getActiveVersion(appId));
    }

    @DeleteMapping("/version/{versionId}")
    @Audit(operationType = "DELETE", module = "APP", targetTable = "app_version", description = "删除应用版本")
    public Result<Void> deleteVersion(@PathVariable Long versionId) {
        microAppService.deleteVersion(versionId);
        return Result.success();
    }
}
