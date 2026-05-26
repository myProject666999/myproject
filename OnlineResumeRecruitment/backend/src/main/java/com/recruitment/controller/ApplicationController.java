package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.dto.ApplicationStatusUpdateDTO;
import com.recruitment.vo.ApplicationVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "投递接口")
@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @ApiOperation("投递职位")
    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<Void> applyJob(@RequestParam Long jobId) {
        return Result.ok();
    }

    @ApiOperation("我的投递记录")
    @GetMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<PageResult<ApplicationVO>> getMyApplications(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.ok();
    }

    @ApiOperation("收到的投递")
    @GetMapping("/received")
    @PreAuthorize("hasRole('HR')")
    public Result<PageResult<ApplicationVO>> getReceivedApplications(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.ok();
    }

    @ApiOperation("更新投递状态")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public Result<Void> updateApplicationStatus(
            @PathVariable Long id,
            @Validated @RequestBody ApplicationStatusUpdateDTO updateDTO) {
        return Result.ok();
    }
}
