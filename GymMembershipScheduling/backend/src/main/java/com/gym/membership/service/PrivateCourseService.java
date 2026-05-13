package com.gym.membership.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gym.membership.common.PageResult;
import com.gym.membership.dto.PrivateCourseDTO;
import com.gym.membership.dto.PrivateScheduleDTO;
import com.gym.membership.entity.*;
import com.gym.membership.exception.BusinessException;
import com.gym.membership.mapper.*;
import com.gym.membership.vo.PrivateScheduleVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrivateCourseService extends ServiceImpl<PrivateCourseMapper, PrivateCourse> {

    private final PrivateScheduleMapper scheduleMapper;
    private final UserMapper userMapper;
    private final CoachPerformanceService coachPerformanceService;

    public PrivateCourseService(PrivateScheduleMapper scheduleMapper,
                                UserMapper userMapper,
                                CoachPerformanceService coachPerformanceService) {
        this.scheduleMapper = scheduleMapper;
        this.userMapper = userMapper;
        this.coachPerformanceService = coachPerformanceService;
    }

    @Transactional(rollbackFor = Exception.class)
    public PrivateCourse createCourse(PrivateCourseDTO dto) {
        PrivateCourse course = new PrivateCourse();
        course.setUserId(dto.getUserId());
        course.setCoachId(dto.getCoachId());
        course.setTotalHours(dto.getTotalHours());
        course.setRemainingHours(dto.getTotalHours());
        course.setPrice(dto.getPrice());
        course.setStatus(1);
        this.save(course);

        coachPerformanceService.addSalesPerformance(dto.getCoachId(), dto.getPrice());

        return course;
    }

    public PageResult<PrivateCourse> getCoursePage(Long pageNum, Long pageSize,
                                                   Long userId, Long coachId, Integer status) {
        Page<PrivateCourse> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<PrivateCourse> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(PrivateCourse::getUserId, userId);
        }
        if (coachId != null) {
            wrapper.eq(PrivateCourse::getCoachId, coachId);
        }
        if (status != null) {
            wrapper.eq(PrivateCourse::getStatus, status);
        }
        wrapper.orderByDesc(PrivateCourse::getCreateTime);

        IPage<PrivateCourse> coursePage = this.page(page, wrapper);

        PageResult<PrivateCourse> result = new PageResult<>();
        result.setTotal(coursePage.getTotal());
        result.setPages(coursePage.getPages());
        result.setCurrent(coursePage.getCurrent());
        result.setSize(coursePage.getSize());
        result.setRecords(coursePage.getRecords());

        return result;
    }

    public List<PrivateCourse> getCoursesByUserId(Long userId) {
        return this.list(new LambdaQueryWrapper<PrivateCourse>()
                .eq(PrivateCourse::getUserId, userId)
                .eq(PrivateCourse::getStatus, 1)
                .orderByDesc(PrivateCourse::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public PrivateSchedule createSchedule(PrivateScheduleDTO dto) {
        PrivateCourse course = this.getById(dto.getCourseId());
        if (course == null) {
            throw new BusinessException("私教课程不存在");
        }
        if (course.getStatus() != 1) {
            throw new BusinessException("私教课程已完成");
        }
        if (course.getRemainingHours() <= 0) {
            throw new BusinessException("剩余课时不足");
        }

        boolean hasConflict = scheduleMapper.selectCount(new LambdaQueryWrapper<PrivateSchedule>()
                .eq(PrivateSchedule::getCoachId, course.getCoachId())
                .eq(PrivateSchedule::getScheduleDate, dto.getScheduleDate())
                .eq(PrivateSchedule::getStatus, 1)
                .and(w -> w
                        .between(PrivateSchedule::getStartTime, dto.getStartTime(), dto.getEndTime())
                        .or()
                        .between(PrivateSchedule::getEndTime, dto.getStartTime(), dto.getEndTime())
                        .or()
                        .and(w2 -> w2
                                .le(PrivateSchedule::getStartTime, dto.getStartTime())
                                .ge(PrivateSchedule::getEndTime, dto.getEndTime()))
                )) > 0;

        if (hasConflict) {
            throw new BusinessException("该教练在同一时间段已有排课");
        }

        PrivateSchedule schedule = new PrivateSchedule();
        schedule.setCourseId(dto.getCourseId());
        schedule.setUserId(course.getUserId());
        schedule.setCoachId(course.getCoachId());
        schedule.setScheduleDate(dto.getScheduleDate());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setStatus(1);
        schedule.setConsumeHours(dto.getConsumeHours() != null ? dto.getConsumeHours() : BigDecimal.valueOf(1));
        scheduleMapper.insert(schedule);

        return schedule;
    }

    public PageResult<PrivateScheduleVO> getSchedulePage(Long pageNum, Long pageSize,
                                                         LocalDate startDate, LocalDate endDate,
                                                         Long userId, Long coachId, Integer status) {
        Page<PrivateSchedule> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<PrivateSchedule> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(PrivateSchedule::getScheduleDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(PrivateSchedule::getScheduleDate, endDate);
        }
        if (userId != null) {
            wrapper.eq(PrivateSchedule::getUserId, userId);
        }
        if (coachId != null) {
            wrapper.eq(PrivateSchedule::getCoachId, coachId);
        }
        if (status != null) {
            wrapper.eq(PrivateSchedule::getStatus, status);
        }
        wrapper.orderByDesc(PrivateSchedule::getScheduleDate)
                .orderByAsc(PrivateSchedule::getStartTime);

        IPage<PrivateSchedule> schedulePage = scheduleMapper.selectPage(page, wrapper);

        PageResult<PrivateScheduleVO> result = new PageResult<>();
        result.setTotal(schedulePage.getTotal());
        result.setPages(schedulePage.getPages());
        result.setCurrent(schedulePage.getCurrent());
        result.setSize(schedulePage.getSize());
        result.setRecords(schedulePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));

        return result;
    }

    private PrivateScheduleVO convertToVO(PrivateSchedule schedule) {
        PrivateScheduleVO vo = new PrivateScheduleVO();
        vo.setId(schedule.getId());
        vo.setCourseId(schedule.getCourseId());
        vo.setUserId(schedule.getUserId());
        vo.setCoachId(schedule.getCoachId());
        vo.setScheduleDate(schedule.getScheduleDate());
        vo.setStartTime(schedule.getStartTime());
        vo.setEndTime(schedule.getEndTime());
        vo.setStatus(schedule.getStatus());
        vo.setConsumeHours(schedule.getConsumeHours());

        if (schedule.getStatus() == null) {
            vo.setStatusName("未知");
        } else {
            switch (schedule.getStatus()) {
                case 1: vo.setStatusName("待上课"); break;
                case 2: vo.setStatusName("已完成"); break;
                case 3: vo.setStatusName("已取消"); break;
                default: vo.setStatusName("未知");
            }
        }

        User user = userMapper.selectById(schedule.getUserId());
        if (user != null) {
            vo.setUserName(user.getRealName());
        }

        User coach = userMapper.selectById(schedule.getCoachId());
        if (coach != null) {
            vo.setCoachName(coach.getRealName());
        }

        return vo;
    }

    public PrivateScheduleVO getScheduleById(Long id) {
        PrivateSchedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new BusinessException("排课记录不存在");
        }
        return convertToVO(schedule);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelSchedule(Long id) {
        PrivateSchedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new BusinessException("排课记录不存在");
        }
        if (schedule.getStatus() != 1) {
            throw new BusinessException("只能取消待上课的排课");
        }

        schedule.setStatus(3);
        scheduleMapper.updateById(schedule);
    }

    @Transactional(rollbackFor = Exception.class)
    public void checkIn(Long id) {
        PrivateSchedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new BusinessException("排课记录不存在");
        }
        if (schedule.getStatus() != 1) {
            throw new BusinessException("只能签到待上课的排课");
        }

        PrivateCourse course = this.getById(schedule.getCourseId());
        if (course == null) {
            throw new BusinessException("私教课程不存在");
        }

        BigDecimal consumeHours = schedule.getConsumeHours() != null ? schedule.getConsumeHours() : BigDecimal.valueOf(1);
        if (course.getRemainingHours().compareTo(consumeHours.intValue()) < 0) {
            throw new BusinessException("剩余课时不足");
        }

        course.setRemainingHours(course.getRemainingHours() - consumeHours.intValue());
        if (course.getRemainingHours() <= 0) {
            course.setStatus(2);
        }
        this.updateById(course);

        schedule.setStatus(2);
        schedule.setCheckInTime(LocalDateTime.now());
        scheduleMapper.updateById(schedule);

        coachPerformanceService.addPrivateClassPerformance(schedule.getCoachId(), schedule.getScheduleDate(), consumeHours);
    }
}
