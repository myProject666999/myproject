package com.recruitment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.common.PageResult;
import com.recruitment.dto.ResumeUpdateDTO;
import com.recruitment.entity.*;
import com.recruitment.enums.RoleEnum;
import com.recruitment.exception.BusinessException;
import com.recruitment.mapper.*;
import com.recruitment.vo.ResumeVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    @Autowired
    private ResumeMapper resumeMapper;

    @Autowired
    private WorkExperienceMapper workExperienceMapper;

    @Autowired
    private EducationExperienceMapper educationExperienceMapper;

    @Autowired
    private ProjectExperienceMapper projectExperienceMapper;

    @Autowired
    private JobApplicationMapper jobApplicationMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private CompanyService companyService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ResumeVO getMyResume() {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.JOB_SEEKER.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有求职者可以查看简历");
        }
        Resume resume = resumeMapper.selectOne(
            new LambdaQueryWrapper<Resume>()
                .eq(Resume::getUserId, currentUser.getId())
                .eq(Resume::getDeleted, 0)
        );
        if (resume == null) {
            return new ResumeVO(null, Arrays.asList(), Arrays.asList(), Arrays.asList());
        }
        return getResumeVO(resume.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public ResumeVO createOrUpdateResume(ResumeUpdateDTO dto) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.JOB_SEEKER.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有求职者可以编辑简历");
        }
        Resume existResume = resumeMapper.selectOne(
            new LambdaQueryWrapper<Resume>()
                .eq(Resume::getUserId, currentUser.getId())
                .eq(Resume::getDeleted, 0)
        );
        Resume resume = new Resume();
        BeanUtils.copyProperties(dto, resume);
        resume.setUserId(currentUser.getId());
        resume.setDeleted(0);
        resume.setUpdatedAt(LocalDateTime.now());

        Long resumeId;
        if (existResume == null) {
            resume.setCreatedAt(LocalDateTime.now());
            resumeMapper.insert(resume);
            resumeId = resume.getId();
        } else {
            resume.setId(existResume.getId());
            resume.setCreatedAt(existResume.getCreatedAt());
            resumeMapper.updateById(resume);
            resumeId = existResume.getId();

            workExperienceMapper.delete(
                new LambdaQueryWrapper<WorkExperience>().eq(WorkExperience::getResumeId, resumeId)
            );
            educationExperienceMapper.delete(
                new LambdaQueryWrapper<EducationExperience>().eq(EducationExperience::getResumeId, resumeId)
            );
            projectExperienceMapper.delete(
                new LambdaQueryWrapper<ProjectExperience>().eq(ProjectExperience::getResumeId, resumeId)
            );
        }

        if (dto.getWorkExperiences() != null) {
            for (WorkExperience exp : dto.getWorkExperiences()) {
                exp.setId(null);
                exp.setResumeId(resumeId);
                exp.setCreatedAt(LocalDateTime.now());
                exp.setUpdatedAt(LocalDateTime.now());
                workExperienceMapper.insert(exp);
            }
        }
        if (dto.getEducationExperiences() != null) {
            for (EducationExperience exp : dto.getEducationExperiences()) {
                exp.setId(null);
                exp.setResumeId(resumeId);
                exp.setCreatedAt(LocalDateTime.now());
                exp.setUpdatedAt(LocalDateTime.now());
                educationExperienceMapper.insert(exp);
            }
        }
        if (dto.getProjectExperiences() != null) {
            for (ProjectExperience exp : dto.getProjectExperiences()) {
                exp.setId(null);
                exp.setResumeId(resumeId);
                exp.setCreatedAt(LocalDateTime.now());
                exp.setUpdatedAt(LocalDateTime.now());
                projectExperienceMapper.insert(exp);
            }
        }

        return getResumeVO(resumeId);
    }

    public ResumeVO getResumeByApplicationId(Long applicationId) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以查看投递简历");
        }
        JobApplication application = jobApplicationMapper.selectById(applicationId);
        if (application == null || application.getDeleted() == 1) {
            throw new BusinessException("投递记录不存在");
        }
        Company company = companyService.getMyCompany();
        if (company == null || !company.getId().equals(application.getCompanyId())) {
            throw new BusinessException("无权限查看此简历");
        }
        if (application.getResumeSnapshot() != null && !application.getResumeSnapshot().isEmpty()) {
            try {
                return objectMapper.readValue(application.getResumeSnapshot(), ResumeVO.class);
            } catch (JsonProcessingException e) {
                throw new BusinessException("简历快照解析失败");
            }
        }
        return getResumeVO(application.getResumeId());
    }

    public PageResult<ResumeVO> searchPublicResumes(String keyword, String city, String position,
                                                    Integer pageNum, Integer pageSize) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以搜索公开简历");
        }
        LambdaQueryWrapper<Resume> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Resume::getIsPublic, 1);
        wrapper.eq(Resume::getDeleted, 0);

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Resume::getRealName, keyword)
                    .or().like(Resume::getSkills, keyword)
                    .or().like(Resume::getIntentionPosition, keyword)
                    .or().like(Resume::getSelfIntroduction, keyword));
        }
        if (city != null && !city.isEmpty()) {
            wrapper.and(w -> w.eq(Resume::getCity, city)
                    .or().eq(Resume::getIntentionCity, city));
        }
        if (position != null && !position.isEmpty()) {
            wrapper.like(Resume::getIntentionPosition, position);
        }
        wrapper.orderByDesc(Resume::getUpdatedAt);

        Page<Resume> page = new Page<>(pageNum, pageSize);
        resumeMapper.selectPage(page, wrapper);

        List<ResumeVO> records = page.getRecords().stream()
                .map(resume -> getResumeVO(resume.getId()))
                .collect(Collectors.toList());

        return PageResult.of(page.getTotal(), records, pageNum, pageSize);
    }

    private ResumeVO getResumeVO(Long resumeId) {
        Resume resume = resumeMapper.selectById(resumeId);
        if (resume == null || resume.getDeleted() == 1) {
            throw new BusinessException("简历不存在");
        }
        List<WorkExperience> workExperiences = workExperienceMapper.selectList(
            new LambdaQueryWrapper<WorkExperience>()
                .eq(WorkExperience::getResumeId, resumeId)
                .orderByAsc(WorkExperience::getStartDate)
        );
        List<EducationExperience> educationExperiences = educationExperienceMapper.selectList(
            new LambdaQueryWrapper<EducationExperience>()
                .eq(EducationExperience::getResumeId, resumeId)
                .orderByAsc(EducationExperience::getStartDate)
        );
        List<ProjectExperience> projectExperiences = projectExperienceMapper.selectList(
            new LambdaQueryWrapper<ProjectExperience>()
                .eq(ProjectExperience::getResumeId, resumeId)
                .orderByAsc(ProjectExperience::getStartDate)
        );
        return new ResumeVO(resume, workExperiences, educationExperiences, projectExperiences);
    }
}
