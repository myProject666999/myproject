package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.dto.JobCreateDTO;
import com.recruitment.dto.JobQueryDTO;
import com.recruitment.entity.Job;
import com.recruitment.vo.JobVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "职位接口")
@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @ApiOperation("分页查询职位列表")
    @GetMapping
    public Result<PageResult<JobVO>> getJobList(@Validated JobQueryDTO queryDTO) {
        return Result.ok();
    }

    @ApiOperation("职位详情")
    @GetMapping("/{id}")
    public Result<JobVO> getJobDetail(@PathVariable Long id) {
        return Result.ok();
    }

    @ApiOperation("热门职位")
    @GetMapping("/hot")
    public Result<List<JobVO>> getHotJobs() {
        return Result.ok();
    }

    @ApiOperation("HR发布职位")
    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public Result<Job> createJob(@Validated @RequestBody JobCreateDTO createDTO) {
        return Result.ok();
    }

    @ApiOperation("HR更新职位状态")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public Result<Void> updateJobStatus(@PathVariable Long id, @RequestParam String status) {
        return Result.ok();
    }

    @ApiOperation("HR查看自己发布的职位")
    @GetMapping("/my")
    @PreAuthorize("hasRole('HR')")
    public Result<PageResult<JobVO>> getMyJobs(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.ok();
    }
}
