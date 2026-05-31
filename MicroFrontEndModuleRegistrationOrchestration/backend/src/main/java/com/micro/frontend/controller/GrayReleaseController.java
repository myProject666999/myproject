package com.micro.frontend.controller;

import com.micro.frontend.annotation.Audit;
import com.micro.frontend.common.PageResult;
import com.micro.frontend.common.Result;
import com.micro.frontend.dto.GrayCreateDTO;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.GrayRelease;
import com.micro.frontend.service.IGrayReleaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gray")
public class GrayReleaseController {

    @Autowired
    private IGrayReleaseService grayReleaseService;

    @GetMapping("/{id}")
    public Result<GrayRelease> getById(@PathVariable Long id) {
        return Result.success(grayReleaseService.getById(id));
    }

    @GetMapping("/no/{grayNo}")
    public Result<GrayRelease> getByGrayNo(@PathVariable String grayNo) {
        return Result.success(grayReleaseService.getByGrayNo(grayNo));
    }

    @GetMapping("/page")
    public Result<PageResult<GrayRelease>> page(PageQueryDTO query) {
        return Result.success(grayReleaseService.page(query));
    }

    @PostMapping
    @Audit(operationType = "CREATE", module = "GRAY", targetTable = "gray_release", description = "创建灰度发布")
    public Result<Void> create(@RequestBody @Validated GrayCreateDTO dto) {
        grayReleaseService.create(dto);
        return Result.success();
    }

    @PutMapping
    @Audit(operationType = "UPDATE", module = "GRAY", targetTable = "gray_release", description = "更新灰度发布")
    public Result<Void> update(@RequestBody GrayRelease gray) {
        grayReleaseService.update(gray);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Audit(operationType = "DELETE", module = "GRAY", targetTable = "gray_release", description = "删除灰度发布")
    public Result<Void> delete(@PathVariable Long id) {
        grayReleaseService.delete(id);
        return Result.success();
    }

    @PostMapping("/start/{id}")
    @Audit(operationType = "UPDATE", module = "GRAY", targetTable = "gray_release", description = "开始灰度发布")
    public Result<Void> start(@PathVariable Long id) {
        grayReleaseService.start(id);
        return Result.success();
    }

    @PostMapping("/pause/{id}")
    @Audit(operationType = "UPDATE", module = "GRAY", targetTable = "gray_release", description = "暂停灰度发布")
    public Result<Void> pause(@PathVariable Long id) {
        grayReleaseService.pause(id);
        return Result.success();
    }

    @PostMapping("/full/{id}")
    @Audit(operationType = "UPDATE", module = "GRAY", targetTable = "gray_release", description = "灰度全量发布")
    public Result<Void> full(@PathVariable Long id) {
        grayReleaseService.full(id);
        return Result.success();
    }

    @PostMapping("/rollback/{id}")
    @Audit(operationType = "ROLLBACK", module = "GRAY", targetTable = "gray_release", description = "灰度回滚")
    public Result<Void> rollback(@PathVariable Long id) {
        grayReleaseService.rollback(id);
        return Result.success();
    }

    @GetMapping("/active/{appId}")
    public Result<GrayRelease> getActiveGray(@PathVariable Long appId) {
        return Result.success(grayReleaseService.getActiveGray(appId));
    }

    @GetMapping("/judge")
    public Result<Map<String, Object>> judge(
            @RequestParam Long appId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String userType) {
        return Result.success(grayReleaseService.judge(appId, userId, userType));
    }
}
