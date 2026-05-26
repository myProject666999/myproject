package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.dto.ResumeUpdateDTO;
import com.recruitment.vo.ResumeVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Api(tags = "简历接口")
@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @ApiOperation("获取我的简历")
    @GetMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<ResumeVO> getMyResume() {
        return Result.ok();
    }

    @ApiOperation("更新我的简历")
    @PutMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<Void> updateMyResume(@Validated @RequestBody ResumeUpdateDTO updateDTO) {
        return Result.ok();
    }

    @ApiOperation("根据ID查看简历")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public Result<ResumeVO> getResumeById(@PathVariable Long id) {
        return Result.ok();
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
        return Result.ok();
    }
}
