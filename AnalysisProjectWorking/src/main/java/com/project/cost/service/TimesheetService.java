package com.project.cost.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.project.cost.entity.*;
import com.project.cost.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class TimesheetService extends ServiceImpl<TimesheetMapper, Timesheet> {

    @Autowired
    private ProjectMemberMapper projectMemberMapper;

    @Autowired
    private ApprovalFlowMapper approvalFlowMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private UserMapper userMapper;

    private static final BigDecimal MAX_DAILY_HOURS = new BigDecimal("24");

    @Transactional
    public Timesheet createTimesheet(Timesheet timesheet) {
        validateTimesheet(timesheet);
        calculateWorkHours(timesheet);
        timesheet.setApprovalStatus(0);
        timesheet.setCreateTime(LocalDateTime.now());
        timesheet.setUpdateTime(LocalDateTime.now());
        save(timesheet);
        return timesheet;
    }

    @Transactional
    public Timesheet updateTimesheet(Timesheet timesheet) {
        Timesheet existing = getById(timesheet.getTimesheetId());
        if (existing == null) {
            throw new RuntimeException("Timesheet not found");
        }
        if (existing.getApprovalStatus() != 0) {
            throw new RuntimeException("Only draft timesheet can be updated");
        }
        validateTimesheet(timesheet);
        calculateWorkHours(timesheet);
        timesheet.setUpdateTime(LocalDateTime.now());
        updateById(timesheet);
        return timesheet;
    }

    @Transactional
    public void submitTimesheet(Long timesheetId) {
        Timesheet timesheet = getById(timesheetId);
        if (timesheet == null) {
            throw new RuntimeException("Timesheet not found");
        }
        if (timesheet.getApprovalStatus() != 0) {
            throw new RuntimeException("Only draft can be submitted");
        }

        Project project = projectMapper.selectById(timesheet.getProjectId());
        User user = userMapper.selectById(timesheet.getUserId());

        List<ApprovalFlow> flows = approvalFlowMapper.findApprovalFlows(
                "timesheet",
                user.getDeptId(),
                timesheet.getProjectId()
        );

        if (flows.isEmpty()) {
            timesheet.setApprovalStatus(2);
            timesheet.setApprovalTime(LocalDateTime.now());
        } else {
            ApprovalFlow firstFlow = flows.get(0);
            timesheet.setCurrentApproverId(firstFlow.getApproverId());
            timesheet.setApprovalStatus(1);
        }

        timesheet.setSubmitTime(LocalDateTime.now());
        timesheet.setUpdateTime(LocalDateTime.now());
        updateById(timesheet);
    }

    @Transactional
    public void approveTimesheet(Long timesheetId, Long approverId, String comment) {
        Timesheet timesheet = getById(timesheetId);
        if (timesheet == null) {
            throw new RuntimeException("Timesheet not found");
        }
        if (timesheet.getApprovalStatus() != 1) {
            throw new RuntimeException("Not pending approval");
        }
        if (!approverId.equals(timesheet.getCurrentApproverId())) {
            throw new RuntimeException("Not authorized approver");
        }

        timesheet.setApprovalStatus(2);
        timesheet.setApprovalTime(LocalDateTime.now());
        timesheet.setUpdateTime(LocalDateTime.now());
        updateById(timesheet);

        ApprovalRecord record = new ApprovalRecord();
        record.setFlowType("timesheet");
        record.setBusinessId(timesheetId);
        record.setApproverId(approverId);
        record.setApproveOrder(1);
        record.setApprovalStatus(2);
        record.setApprovalComment(comment);
        record.setApprovalTime(LocalDateTime.now());
    }

    @Transactional
    public void rejectTimesheet(Long timesheetId, Long approverId, String reason) {
        Timesheet timesheet = getById(timesheetId);
        if (timesheet == null) {
            throw new RuntimeException("Timesheet not found");
        }
        if (timesheet.getApprovalStatus() != 1) {
            throw new RuntimeException("Not pending approval");
        }
        if (!approverId.equals(timesheet.getCurrentApproverId())) {
            throw new RuntimeException("Not authorized approver");
        }

        timesheet.setApprovalStatus(3);
        timesheet.setRejectionReason(reason);
        timesheet.setApprovalTime(LocalDateTime.now());
        timesheet.setUpdateTime(LocalDateTime.now());
        updateById(timesheet);
    }

    private void validateTimesheet(Timesheet timesheet) {
        LambdaQueryWrapper<ProjectMember> memberWrapper = new LambdaQueryWrapper<>();
        memberWrapper.eq(ProjectMember::getProjectId, timesheet.getProjectId())
                .eq(ProjectMember::getUserId, timesheet.getUserId());
        if (projectMemberMapper.selectCount(memberWrapper) == 0) {
            throw new RuntimeException("User is not a member of this project");
        }

        if (timesheet.getStartTime() != null && timesheet.getEndTime() != null) {
            if (timesheet.getStartTime().isAfter(timesheet.getEndTime())) {
                throw new RuntimeException("Start time must be before end time");
            }
        }

        List<Timesheet> existing = baseMapper.findOverlappingTimesheets(
                timesheet.getUserId(),
                timesheet.getWorkDate(),
                timesheet.getTimesheetId() == null ? -1L : timesheet.getTimesheetId()
        );

        for (Timesheet t : existing) {
            if (isTimeOverlap(timesheet.getStartTime(), timesheet.getEndTime(),
                    t.getStartTime(), t.getEndTime())) {
                throw new RuntimeException("Time overlaps with existing timesheet");
            }
        }

        BigDecimal currentHours = baseMapper.getTotalHoursByDate(
                timesheet.getUserId(),
                timesheet.getWorkDate(),
                timesheet.getTimesheetId() == null ? -1L : timesheet.getTimesheetId()
        );

        BigDecimal newHours = calculateHours(timesheet.getStartTime(), timesheet.getEndTime());
        if (currentHours.add(newHours).compareTo(MAX_DAILY_HOURS) > 0) {
            throw new RuntimeException("Daily hours exceed maximum allowed 24 hours");
        }
    }

    private boolean isTimeOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    private BigDecimal calculateHours(LocalTime start, LocalTime end) {
        Duration duration = Duration.between(start, end);
        long minutes = duration.toMinutes();
        return new BigDecimal(minutes).divide(new BigDecimal(60), 2, BigDecimal.ROUND_HALF_UP);
    }

    private void calculateWorkHours(Timesheet timesheet) {
        if (timesheet.getStartTime() != null && timesheet.getEndTime() != null) {
            timesheet.setWorkHours(calculateHours(timesheet.getStartTime(), timesheet.getEndTime()));
        }
    }

    public List<Timesheet> getMyTimesheets(Long userId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<Timesheet> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Timesheet::getUserId, userId)
                .between(Timesheet::getWorkDate, startDate, endDate)
                .orderByDesc(Timesheet::getWorkDate);
        return list(wrapper);
    }

    public List<Timesheet> getPendingApprovals(Long approverId) {
        LambdaQueryWrapper<Timesheet> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Timesheet::getCurrentApproverId, approverId)
                .eq(Timesheet::getApprovalStatus, 1)
                .orderByDesc(Timesheet::getSubmitTime);
        return list(wrapper);
    }
}
