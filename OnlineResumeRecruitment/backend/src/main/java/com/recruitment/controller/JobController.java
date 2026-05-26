package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.dto.JobCreateDTO;
import com.recruitment.dto.JobQueryDTO;
import com.recruitment.entity.Company;
import com.recruitment.entity.Job;
import com.recruitment.service.CompanyService;
import com.recruitment.service.JobService;
import com.recruitment.vo.JobVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Api(tags = "职位接口")
@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private CompanyService companyService;

    @ApiOperation("分页查询职位列表")
    @GetMapping
    public Result<PageResult<JobVO>> getJobList(@Validated JobQueryDTO queryDTO) {
        PageResult<Job> jobPage = jobService.getJobList(queryDTO);
        List<JobVO> jobVOList = buildJobVOList(jobPage.getRecords());
        PageResult<JobVO> result = PageResult.of(jobPage.getTotal(), jobVOList, queryDTO.getPageNum(), queryDTO.getPageSize());
        return Result.ok(result);
    }

    @ApiOperation("职位详情")
    @GetMapping("/{id}")
    public Result<JobVO> getJobDetail(@PathVariable Long id) {
        Job job = jobService.getJobDetail(id);
        Company company = null;
        if (job.getCompanyId() != null) {
            try {
                company = companyService.getCompanyById(job.getCompanyId());
            } catch (Exception e) {
            }
        }
        return Result.ok(new JobVO(job, company));
    }

    @ApiOperation("热门职位")
    @GetMapping("/hot")
    public Result<List<JobVO>> getHotJobs() {
        List<Job> hotJobs = jobService.getHotJobs();
        return Result.ok(buildJobVOList(hotJobs));
    }

    @ApiOperation("HR发布职位")
    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public Result<Job> createJob(@Validated @RequestBody JobCreateDTO createDTO) {
        return Result.ok(jobService.publishJob(createDTO));
    }

    @ApiOperation("HR更新职位状态")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public Result<Job> updateJobStatus(@PathVariable Long id, @RequestParam String status) {
        return Result.ok(jobService.updateJobStatus(id, status));
    }

    @ApiOperation("HR查看自己发布的职位")
    @GetMapping("/my")
    @PreAuthorize("hasRole('HR')")
    public Result<PageResult<JobVO>> getMyJobs(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PageResult<Job> jobPage = jobService.getMyJobs(pageNum, pageSize);
        List<JobVO> jobVOList = buildJobVOList(jobPage.getRecords());
        PageResult<JobVO> result = PageResult.of(jobPage.getTotal(), jobVOList, pageNum, pageSize);
        return Result.ok(result);
    }

    private List<JobVO> buildJobVOList(List<Job> jobs) {
        if (jobs == null || jobs.isEmpty()) {
            return new ArrayList<>();
        }
        List<Long> companyIds = jobs.stream()
                .map(Job::getCompanyId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Company> companyMap = new java.util.HashMap<>();
        for (Long companyId : companyIds) {
            try {
                Company company = companyService.getCompanyById(companyId);
                if (company != null) {
                    companyMap.put(companyId, company);
                }
            } catch (Exception e) {
            }
        }
        return jobs.stream()
                .map(job -> new JobVO(job, companyMap.get(job.getCompanyId())))
                .collect(Collectors.toList());
    }
}