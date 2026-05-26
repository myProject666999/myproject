package com.recruitment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.recruitment.common.PageResult;
import com.recruitment.dto.JobCreateDTO;
import com.recruitment.dto.JobQueryDTO;
import com.recruitment.entity.Company;
import com.recruitment.entity.Job;
import com.recruitment.entity.User;
import com.recruitment.enums.JobStatusEnum;
import com.recruitment.enums.RoleEnum;
import com.recruitment.exception.BusinessException;
import com.recruitment.mapper.CompanyMapper;
import com.recruitment.mapper.JobMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class JobService {

    private static final String HOT_JOBS_CACHE_KEY = "hot:jobs";
    private static final long HOT_JOBS_CACHE_EXPIRE = 30;

    @Autowired
    private JobMapper jobMapper;

    @Autowired
    private CompanyMapper companyMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public PageResult<Job> getJobList(JobQueryDTO dto) {
        LambdaQueryWrapper<Job> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Job::getStatus, JobStatusEnum.OPEN.name());
        wrapper.eq(Job::getDeleted, 0);

        if (dto.getKeyword() != null && !dto.getKeyword().isEmpty()) {
            wrapper.and(w -> w.like(Job::getTitle, dto.getKeyword())
                    .or().like(Job::getKeywords, dto.getKeyword())
                    .or().like(Job::getDescription, dto.getKeyword()));
        }
        if (dto.getCity() != null && !dto.getCity().isEmpty()) {
            wrapper.eq(Job::getCity, dto.getCity());
        }
        if (dto.getMinSalary() != null) {
            wrapper.ge(Job::getMaxSalary, dto.getMinSalary());
        }
        if (dto.getMaxSalary() != null) {
            wrapper.le(Job::getMinSalary, dto.getMaxSalary());
        }
        if (dto.getJobType() != null && !dto.getJobType().isEmpty()) {
            wrapper.eq(Job::getJobType, dto.getJobType());
        }
        if (dto.getExperience() != null && !dto.getExperience().isEmpty()) {
            wrapper.eq(Job::getExperience, dto.getExperience());
        }
        if (dto.getEducation() != null && !dto.getEducation().isEmpty()) {
            wrapper.eq(Job::getEducation, dto.getEducation());
        }
        if (dto.getIndustry() != null && !dto.getIndustry().isEmpty()) {
            List<Company> companies = companyMapper.selectList(
                new LambdaQueryWrapper<Company>().eq(Company::getIndustry, dto.getIndustry())
            );
            if (!companies.isEmpty()) {
                List<Long> companyIds = companies.stream().map(Company::getId).toList();
                wrapper.in(Job::getCompanyId, companyIds);
            } else {
                return PageResult.of(0L, List.of(), dto.getPageNum(), dto.getPageSize());
            }
        }

        wrapper.orderByDesc(Job::getHotScore, Job::getCreatedAt);

        Page<Job> page = new Page<>(dto.getPageNum(), dto.getPageSize());
        jobMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getRecords(), dto.getPageNum(), dto.getPageSize());
    }

    @Transactional(rollbackFor = Exception.class)
    public Job getJobDetail(Long id) {
        Job job = jobMapper.selectById(id);
        if (job == null || job.getDeleted() == 1) {
            throw new BusinessException("职位不存在");
        }
        job.setViewCount(job.getViewCount() == null ? 1 : job.getViewCount() + 1);
        job.setHotScore(calculateHotScore(job));
        jobMapper.updateById(job);
        return job;
    }

    @Transactional(rollbackFor = Exception.class)
    public Job publishJob(JobCreateDTO dto) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以发布职位");
        }
        Company company = companyMapper.selectOne(
            new LambdaQueryWrapper<Company>().eq(Company::getHrId, currentUser.getId())
        );
        if (company == null) {
            throw new BusinessException("请先完善企业信息");
        }
        Job job = new Job();
        job.setCompanyId(company.getId());
        job.setHrId(currentUser.getId());
        job.setTitle(dto.getTitle());
        job.setDepartment(dto.getDepartment());
        job.setJobType(dto.getJobType());
        job.setMinSalary(dto.getMinSalary());
        job.setMaxSalary(dto.getMaxSalary());
        job.setSalaryMonths(dto.getSalaryMonths());
        job.setProvince(dto.getProvince());
        job.setCity(dto.getCity());
        job.setAddress(dto.getAddress());
        job.setExperience(dto.getExperience());
        job.setEducation(dto.getEducation());
        if (dto.getKeywords() != null && !dto.getKeywords().isEmpty()) {
            job.setKeywords(String.join(",", dto.getKeywords()));
        }
        job.setDescription(dto.getDescription());
        job.setRequirements(dto.getRequirements());
        job.setBenefits(dto.getBenefits());
        job.setStatus(JobStatusEnum.OPEN.name());
        job.setViewCount(0);
        job.setApplyCount(0);
        job.setHotScore(0);
        job.setDeleted(0);
        job.setCreatedAt(LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());
        jobMapper.insert(job);
        return job;
    }

    @Transactional(rollbackFor = Exception.class)
    public Job updateJobStatus(Long jobId, String status) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以更新职位状态");
        }
        Job job = jobMapper.selectById(jobId);
        if (job == null || job.getDeleted() == 1) {
            throw new BusinessException("职位不存在");
        }
        if (!job.getHrId().equals(currentUser.getId())) {
            throw new BusinessException("无权限修改此职位");
        }
        try {
            JobStatusEnum.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("无效的职位状态");
        }
        job.setStatus(status);
        job.setUpdatedAt(LocalDateTime.now());
        jobMapper.updateById(job);
        return job;
    }

    @SuppressWarnings("unchecked")
    public List<Job> getHotJobs() {
        List<Job> hotJobs = (List<Job>) redisTemplate.opsForValue().get(HOT_JOBS_CACHE_KEY);
        if (hotJobs != null && !hotJobs.isEmpty()) {
            return hotJobs;
        }
        LambdaQueryWrapper<Job> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Job::getStatus, JobStatusEnum.OPEN.name());
        wrapper.eq(Job::getDeleted, 0);
        wrapper.orderByDesc(Job::getHotScore, Job::getViewCount);
        wrapper.last("LIMIT 10");
        hotJobs = jobMapper.selectList(wrapper);
        redisTemplate.opsForValue().set(HOT_JOBS_CACHE_KEY, hotJobs, HOT_JOBS_CACHE_EXPIRE, TimeUnit.MINUTES);
        return hotJobs;
    }

    public PageResult<Job> fullTextSearch(String keyword, Integer pageNum, Integer pageSize) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new BusinessException("搜索关键词不能为空");
        }
        Page<Job> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Job> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Job::getStatus, JobStatusEnum.OPEN.name());
        wrapper.eq(Job::getDeleted, 0);
        wrapper.apply("MATCH(title, keywords, description, requirements) AGAINST({0} IN BOOLEAN MODE)", keyword);
        wrapper.orderByDesc(Job::getHotScore, Job::getCreatedAt);
        jobMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getRecords(), pageNum, pageSize);
    }

    private Integer calculateHotScore(Job job) {
        int viewScore = (job.getViewCount() == null ? 0 : job.getViewCount()) * 1;
        int applyScore = (job.getApplyCount() == null ? 0 : job.getApplyCount()) * 10;
        return viewScore + applyScore;
    }
}
