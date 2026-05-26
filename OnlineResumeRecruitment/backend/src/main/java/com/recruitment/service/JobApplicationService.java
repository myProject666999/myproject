package com.recruitment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.common.PageResult;
import com.recruitment.dto.ApplicationStatusUpdateDTO;
import com.recruitment.entity.*;
import com.recruitment.enums.ApplicationStatusEnum;
import com.recruitment.enums.NotificationTypeEnum;
import com.recruitment.enums.RoleEnum;
import com.recruitment.exception.BusinessException;
import com.recruitment.mapper.ApplicationStatusHistoryMapper;
import com.recruitment.mapper.JobApplicationMapper;
import com.recruitment.mapper.JobMapper;
import com.recruitment.vo.ResumeVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JobApplicationService {

    private static final Map<String, List<String>> STATUS_TRANSITIONS;
    static {
        STATUS_TRANSITIONS = new HashMap<>();
        STATUS_TRANSITIONS.put(ApplicationStatusEnum.PENDING.name(), Arrays.asList(
            ApplicationStatusEnum.VIEWED.name(),
            ApplicationStatusEnum.REJECTED.name()
        ));
        STATUS_TRANSITIONS.put(ApplicationStatusEnum.VIEWED.name(), Arrays.asList(
            ApplicationStatusEnum.PASSED.name(),
            ApplicationStatusEnum.REJECTED.name()
        ));
        STATUS_TRANSITIONS.put(ApplicationStatusEnum.PASSED.name(), Arrays.asList(
            ApplicationStatusEnum.INTERVIEW.name(),
            ApplicationStatusEnum.REJECTED.name()
        ));
        STATUS_TRANSITIONS.put(ApplicationStatusEnum.INTERVIEW.name(), Arrays.asList(
            ApplicationStatusEnum.OFFER.name(),
            ApplicationStatusEnum.REJECTED.name()
        ));
        STATUS_TRANSITIONS.put(ApplicationStatusEnum.OFFER.name(), Arrays.asList(
            ApplicationStatusEnum.HIRED.name(),
            ApplicationStatusEnum.REJECTED.name()
        ));
        STATUS_TRANSITIONS.put(ApplicationStatusEnum.HIRED.name(), Arrays.asList());
        STATUS_TRANSITIONS.put(ApplicationStatusEnum.REJECTED.name(), Arrays.asList());
    }

    @Autowired
    private JobApplicationMapper jobApplicationMapper;

    @Autowired
    private ApplicationStatusHistoryMapper statusHistoryMapper;

    @Autowired
    private JobMapper jobMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(rollbackFor = Exception.class)
    public JobApplication applyJob(Long jobId) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.JOB_SEEKER.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有求职者可以投递职位");
        }
        Job job = jobMapper.selectById(jobId);
        if (job == null || job.getDeleted() == 1) {
            throw new BusinessException("职位不存在");
        }
        if (!ApplicationStatusEnum.PENDING.name().equals(job.getStatus())
                && !"OPEN".equals(job.getStatus())) {
            throw new BusinessException("该职位已停止招聘");
        }
        ResumeVO resumeVO = resumeService.getMyResume();
        if (resumeVO.getResume() == null) {
            throw new BusinessException("请先完善简历");
        }
        JobApplication existApplication = jobApplicationMapper.selectOne(
            new LambdaQueryWrapper<JobApplication>()
                .eq(JobApplication::getJobId, jobId)
                .eq(JobApplication::getUserId, currentUser.getId())
                .eq(JobApplication::getDeleted, 0)
        );
        if (existApplication != null) {
            throw new BusinessException("您已投递过该职位");
        }
        String resumeSnapshot;
        try {
            resumeSnapshot = objectMapper.writeValueAsString(resumeVO);
        } catch (JsonProcessingException e) {
            throw new BusinessException("简历快照生成失败");
        }
        JobApplication application = new JobApplication();
        application.setJobId(jobId);
        application.setResumeId(resumeVO.getResume().getId());
        application.setUserId(currentUser.getId());
        application.setCompanyId(job.getCompanyId());
        application.setHrId(job.getHrId());
        application.setStatus(ApplicationStatusEnum.PENDING.name());
        application.setResumeSnapshot(resumeSnapshot);
        application.setAppliedAt(LocalDateTime.now());
        application.setDeleted(0);
        application.setCreatedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());
        jobApplicationMapper.insert(application);

        job.setApplyCount(job.getApplyCount() == null ? 1 : job.getApplyCount() + 1);
        jobMapper.updateById(job);

        recordStatusHistory(application.getId(), currentUser.getId(), currentUser.getRole(),
            null, ApplicationStatusEnum.PENDING.name(), "投递简历");

        notificationService.sendNotificationAsync(
            job.getHrId(), currentUser.getId(), NotificationTypeEnum.APPLICATION,
            "新的简历投递", currentUser.getRealName() + "投递了您发布的【" + job.getTitle() + "】职位",
            "JOB_APPLICATION", application.getId()
        );

        return application;
    }

    public PageResult<JobApplication> getHRApplications(Long jobId, String status,
                                                        Integer pageNum, Integer pageSize) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以查看投递列表");
        }
        LambdaQueryWrapper<JobApplication> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobApplication::getHrId, currentUser.getId());
        wrapper.eq(JobApplication::getDeleted, 0);
        if (jobId != null) {
            wrapper.eq(JobApplication::getJobId, jobId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(JobApplication::getStatus, status);
        }
        wrapper.orderByDesc(JobApplication::getAppliedAt);

        Page<JobApplication> page = new Page<>(pageNum, pageSize);
        jobApplicationMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getRecords(), pageNum, pageSize);
    }

    public PageResult<JobApplication> getMyApplications(String status, Integer pageNum, Integer pageSize) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.JOB_SEEKER.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有求职者可以查看投递记录");
        }
        LambdaQueryWrapper<JobApplication> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(JobApplication::getUserId, currentUser.getId());
        wrapper.eq(JobApplication::getDeleted, 0);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(JobApplication::getStatus, status);
        }
        wrapper.orderByDesc(JobApplication::getAppliedAt);

        Page<JobApplication> page = new Page<>(pageNum, pageSize);
        jobApplicationMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getRecords(), pageNum, pageSize);
    }

    @Transactional(rollbackFor = Exception.class)
    public JobApplication updateApplicationStatus(ApplicationStatusUpdateDTO dto) {
        User currentUser = userService.getCurrentUser();
        if (!RoleEnum.HR.name().equals(currentUser.getRole())) {
            throw new BusinessException("只有HR可以更新投递状态");
        }
        JobApplication application = jobApplicationMapper.selectById(dto.getApplicationId());
        if (application == null || application.getDeleted() == 1) {
            throw new BusinessException("投递记录不存在");
        }
        if (!application.getHrId().equals(currentUser.getId())) {
            throw new BusinessException("无权限修改此投递状态");
        }
        String fromStatus = application.getStatus();
        String toStatus = dto.getStatus();
        validateStatusTransition(fromStatus, toStatus);

        application.setStatus(toStatus);
        application.setHrRemark(dto.getRemark());
        application.setUpdatedAt(LocalDateTime.now());

        if (ApplicationStatusEnum.VIEWED.name().equals(toStatus)) {
            application.setViewedAt(LocalDateTime.now());
        }
        if (ApplicationStatusEnum.INTERVIEW.name().equals(toStatus)
                || ApplicationStatusEnum.OFFER.name().equals(toStatus)
                || ApplicationStatusEnum.HIRED.name().equals(toStatus)) {
            application.setProcessedAt(LocalDateTime.now());
            if (dto.getInterviewTime() != null) {
                application.setInterviewTime(dto.getInterviewTime());
            }
            if (dto.getInterviewVenue() != null) {
                application.setInterviewVenue(dto.getInterviewVenue());
            }
        }
        jobApplicationMapper.updateById(application);

        recordStatusHistory(application.getId(), currentUser.getId(), currentUser.getRole(),
            fromStatus, toStatus, dto.getRemark());

        String notificationContent = buildNotificationContent(application, toStatus, dto);
        notificationService.sendNotificationAsync(
            application.getUserId(), currentUser.getId(),
            getNotificationType(toStatus),
            getNotificationTitle(toStatus),
            notificationContent,
            "JOB_APPLICATION", application.getId()
        );

        return application;
    }

    private void validateStatusTransition(String fromStatus, String toStatus) {
        try {
            ApplicationStatusEnum.valueOf(toStatus);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("无效的投递状态");
        }
        if (fromStatus.equals(toStatus)) {
            return;
        }
        List<String> allowedTransitions = STATUS_TRANSITIONS.get(fromStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(toStatus)) {
            throw new BusinessException("不允许从 " + fromStatus + " 转换到 " + toStatus);
        }
    }

    private void recordStatusHistory(Long applicationId, Long operatorId, String operatorRole,
                                     String fromStatus, String toStatus, String remark) {
        ApplicationStatusHistory history = new ApplicationStatusHistory();
        history.setApplicationId(applicationId);
        history.setOperatorId(operatorId);
        history.setOperatorRole(operatorRole);
        history.setFromStatus(fromStatus);
        history.setToStatus(toStatus);
        history.setRemark(remark);
        history.setCreatedAt(LocalDateTime.now());
        statusHistoryMapper.insert(history);
    }

    private NotificationTypeEnum getNotificationType(String status) {
        if (ApplicationStatusEnum.INTERVIEW.name().equals(status)) {
            return NotificationTypeEnum.INTERVIEW;
        }
        return NotificationTypeEnum.APPLICATION;
    }

    private String getNotificationTitle(String status) {
        ApplicationStatusEnum statusEnum = ApplicationStatusEnum.valueOf(status);
        return "投递状态更新：" + statusEnum.getDescription();
    }

    private String buildNotificationContent(JobApplication application, String toStatus,
                                            ApplicationStatusUpdateDTO dto) {
        Job job = jobMapper.selectById(application.getJobId());
        String jobTitle = job != null ? job.getTitle() : "职位";
        StringBuilder content = new StringBuilder();
        content.append("您投递的【").append(jobTitle).append("】职位");
        content.append("状态已更新为：").append(ApplicationStatusEnum.valueOf(toStatus).getDescription());
        if (dto.getRemark() != null && !dto.getRemark().isEmpty()) {
            content.append("。备注：").append(dto.getRemark());
        }
        if (ApplicationStatusEnum.INTERVIEW.name().equals(toStatus)) {
            if (dto.getInterviewTime() != null) {
                content.append("。面试时间：").append(dto.getInterviewTime());
            }
            if (dto.getInterviewVenue() != null) {
                content.append("。面试地点：").append(dto.getInterviewVenue());
            }
        }
        return content.toString();
    }
}
