package com.recruitment.controller;

import com.recruitment.common.PageResult;
import com.recruitment.common.Result;
import com.recruitment.dto.ApplicationStatusUpdateDTO;
import com.recruitment.entity.Company;
import com.recruitment.entity.Job;
import com.recruitment.entity.JobApplication;
import com.recruitment.entity.User;
import com.recruitment.service.CompanyService;
import com.recruitment.service.JobApplicationService;
import com.recruitment.service.JobService;
import com.recruitment.service.UserService;
import com.recruitment.vo.ApplicationVO;
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

@Api(tags = "投递接口")
@RestController
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private JobApplicationService applicationService;

    @Autowired
    private JobService jobService;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private UserService userService;

    @ApiOperation("投递职位")
    @PostMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<JobApplication> applyJob(@RequestParam Long jobId) {
        return Result.ok(applicationService.applyJob(jobId));
    }

    @ApiOperation("我的投递记录")
    @GetMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public Result<PageResult<ApplicationVO>> getMyApplications(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PageResult<JobApplication> appPage = applicationService.getMyApplications(status, pageNum, pageSize);
        List<ApplicationVO> voList = buildApplicationVOList(appPage.getRecords());
        PageResult<ApplicationVO> result = PageResult.of(appPage.getTotal(), voList, pageNum, pageSize);
        return Result.ok(result);
    }

    @ApiOperation("收到的投递")
    @GetMapping("/received")
    @PreAuthorize("hasRole('HR')")
    public Result<PageResult<ApplicationVO>> getReceivedApplications(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PageResult<JobApplication> appPage = applicationService.getHRApplications(jobId, status, pageNum, pageSize);
        List<ApplicationVO> voList = buildApplicationVOList(appPage.getRecords());
        PageResult<ApplicationVO> result = PageResult.of(appPage.getTotal(), voList, pageNum, pageSize);
        return Result.ok(result);
    }

    @ApiOperation("更新投递状态")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('HR')")
    public Result<JobApplication> updateApplicationStatus(
            @PathVariable Long id,
            @Validated @RequestBody ApplicationStatusUpdateDTO updateDTO) {
        updateDTO.setApplicationId(id);
        return Result.ok(applicationService.updateApplicationStatus(updateDTO));
    }

    private List<ApplicationVO> buildApplicationVOList(List<JobApplication> applications) {
        if (applications == null || applications.isEmpty()) {
            return new ArrayList<>();
        }
        List<Long> jobIds = applications.stream()
                .map(JobApplication::getJobId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Job> jobMap = new java.util.HashMap<>();
        Map<Long, Company> companyMap = new java.util.HashMap<>();
        Map<Long, User> userMap = new java.util.HashMap<>();

        for (JobApplication app : applications) {
            if (app.getJobId() != null && !jobMap.containsKey(app.getJobId())) {
                try {
                    Job job = jobService.getJobDetail(app.getJobId());
                    if (job != null) {
                        jobMap.put(app.getJobId(), job);
                        if (job.getCompanyId() != null && !companyMap.containsKey(job.getCompanyId())) {
                            Company company = companyService.getCompanyById(job.getCompanyId());
                            if (company != null) {
                                companyMap.put(job.getCompanyId(), company);
                            }
                        }
                    }
                } catch (Exception e) {
                }
            }
            if (app.getUserId() != null && !userMap.containsKey(app.getUserId())) {
                try {
                    User user = userService.getById(app.getUserId());
                    if (user != null) {
                        userMap.put(app.getUserId(), user);
                    }
                } catch (Exception e) {
                }
            }
        }

        return applications.stream()
                .map(app -> new ApplicationVO(
                        app,
                        jobMap.get(app.getJobId()),
                        companyMap.get(app.getCompanyId()),
                        userMap.get(app.getUserId())
                ))
                .collect(Collectors.toList());
    }
}