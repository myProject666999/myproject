package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.dto.ResumeUpdateDTO;
import com.recruitment.service.ResumeService;
import com.recruitment.vo.ResumeVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "简历接口")
@RestController
@RequestMapping("/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @ApiOperation("获取我的简历")
    @GetMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<ResumeVO> getMyResume() {
        return Result.ok(resumeService.getMyResume());
    }

    @ApiOperation("更新我的简历")
    @PutMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<ResumeVO> updateMyResume(@Validated @RequestBody ResumeUpdateDTO updateDTO) {
        return Result.ok(resumeService.createOrUpdateResume(updateDTO));
    }

    @ApiOperation("根据投递ID查看简历")
    @GetMapping("/application/{applicationId}")
    @PreAuthorize("hasRole('HR')")
    public Result<ResumeVO> getResumeByApplicationId(@PathVariable Long applicationId) {
        return Result.ok(resumeService.getResumeByApplicationId(applicationId));
    }

    @ApiOperation("根据ID查看简历")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public Result<ResumeVO> getResumeById(@PathVariable Long id) {
        return Result.ok(resumeService.getResumeByApplicationId(id));
    }

    @ApiOperation("搜索公开简历")
    @GetMapping("/search")
    @PreAuthorize("hasRole('HR')")
    public Result<PageResult<ResumeVO>> searchResumes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String experience,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.ok(resumeService.searchPublicResumes(keyword, city, education, pageNum, pageSize));
    }
}