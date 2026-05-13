package com.gym.membership.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gym.membership.common.PageResult;
import com.gym.membership.dto.GroupClassScheduleDTO;
import com.gym.membership.entity.*;
import com.gym.membership.exception.BusinessException;
import com.gym.membership.mapper.*;
import com.gym.membership.vo.GroupClassScheduleVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupClassService extends ServiceImpl<GroupClassScheduleMapper, GroupClassSchedule> {

    private final CourseTypeMapper courseTypeMapper;
    private final UserMapper userMapper;
    private final GroupClassBookingMapper bookingMapper;
    private final MembershipCardService membershipCardService;
    private final CoachPerformanceService coachPerformanceService;

    public GroupClassService(CourseTypeMapper courseTypeMapper,
                             UserMapper userMapper,
                             GroupClassBookingMapper bookingMapper,
                             MembershipCardService membershipCardService,
                             CoachPerformanceService coachPerformanceService) {
        this.courseTypeMapper = courseTypeMapper;
        this.userMapper = userMapper;
        this.bookingMapper = bookingMapper;
        this.membershipCardService = membershipCardService;
        this.coachPerformanceService = coachPerformanceService;
    }

    public List<CourseType> getCourseTypeList() {
        return courseTypeMapper.selectList(new LambdaQueryWrapper<CourseType>()
                .eq(CourseType::getStatus, 1));
    }

    @Transactional(rollbackFor = Exception.class)
    public void createSchedule(GroupClassScheduleDTO dto) {
        boolean hasConflict = this.count(new LambdaQueryWrapper<GroupClassSchedule>()
                .eq(GroupClassSchedule::getCoachId, dto.getCoachId())
                .eq(GroupClassSchedule::getClassDate, dto.getClassDate())
                .eq(GroupClassSchedule::getStatus, 1)
                .and(w -> w
                        .between(GroupClassSchedule::getStartTime, dto.getStartTime(), dto.getEndTime())
                        .or()
                        .between(GroupClassSchedule::getEndTime, dto.getStartTime(), dto.getEndTime())
                        .or()
                        .and(w2 -> w2
                                .le(GroupClassSchedule::getStartTime, dto.getStartTime())
                                .ge(GroupClassSchedule::getEndTime, dto.getEndTime()))
                )) > 0;

        if (hasConflict) {
            throw new BusinessException("该教练在同一时间段已有排课");
        }

        GroupClassSchedule schedule = new GroupClassSchedule();
        schedule.setCourseTypeId(dto.getCourseTypeId());
        schedule.setCoachId(dto.getCoachId());
        schedule.setClassDate(dto.getClassDate());
        schedule.setStartTime(dto.getStartTime());
        schedule.setEndTime(dto.getEndTime());
        schedule.setClassroom(dto.getClassroom());
        schedule.setMaxParticipants(dto.getMaxParticipants() != null ? dto.getMaxParticipants() : 20);
        schedule.setCurrentParticipants(0);
        schedule.setStatus(1);
        this.save(schedule);
    }

    public PageResult<GroupClassScheduleVO> getSchedulePage(Long pageNum, Long pageSize,
                                                            LocalDate startDate, LocalDate endDate,
                                                            Long courseTypeId, Long coachId, Integer status) {
        Page<GroupClassSchedule> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<GroupClassSchedule> wrapper = new LambdaQueryWrapper<>();
        if (startDate != null) {
            wrapper.ge(GroupClassSchedule::getClassDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(GroupClassSchedule::getClassDate, endDate);
        }
        if (courseTypeId != null) {
            wrapper.eq(GroupClassSchedule::getCourseTypeId, courseTypeId);
        }
        if (coachId != null) {
            wrapper.eq(GroupClassSchedule::getCoachId, coachId);
        }
        if (status != null) {
            wrapper.eq(GroupClassSchedule::getStatus, status);
        }
        wrapper.orderByDesc(GroupClassSchedule::getClassDate)
                .orderByAsc(GroupClassSchedule::getStartTime);

        IPage<GroupClassSchedule> schedulePage = this.page(page, wrapper);

        PageResult<GroupClassScheduleVO> result = new PageResult<>();
        result.setTotal(schedulePage.getTotal());
        result.setPages(schedulePage.getPages());
        result.setCurrent(schedulePage.getCurrent());
        result.setSize(schedulePage.getSize());
        result.setRecords(schedulePage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));

        return result;
    }

    private GroupClassScheduleVO convertToVO(GroupClassSchedule schedule) {
        GroupClassScheduleVO vo = new GroupClassScheduleVO();
        vo.setId(schedule.getId());
        vo.setCourseTypeId(schedule.getCourseTypeId());
        vo.setCoachId(schedule.getCoachId());
        vo.setClassDate(schedule.getClassDate());
        vo.setStartTime(schedule.getStartTime());
        vo.setEndTime(schedule.getEndTime());
        vo.setClassroom(schedule.getClassroom());
        vo.setMaxParticipants(schedule.getMaxParticipants());
        vo.setCurrentParticipants(schedule.getCurrentParticipants());
        vo.setStatus(schedule.getStatus());

        if (schedule.getStatus() == null) {
            vo.setStatusName("未知");
        } else {
            switch (schedule.getStatus()) {
                case 1: vo.setStatusName("可预约"); break;
                case 2: vo.setStatusName("已取消"); break;
                default: vo.setStatusName("未知");
            }
        }

        CourseType courseType = courseTypeMapper.selectById(schedule.getCourseTypeId());
        if (courseType != null) {
            vo.setCourseTypeName(courseType.getTypeName());
        }

        User coach = userMapper.selectById(schedule.getCoachId());
        if (coach != null) {
            vo.setCoachName(coach.getRealName());
        }

        return vo;
    }

    public GroupClassScheduleVO getScheduleById(Long id) {
        GroupClassSchedule schedule = this.getById(id);
        if (schedule == null) {
            throw new BusinessException("排课不存在");
        }
        return convertToVO(schedule);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelSchedule(Long id) {
        GroupClassSchedule schedule = this.getById(id);
        if (schedule == null) {
            throw new BusinessException("排课不存在");
        }
        if (schedule.getStatus() != 1) {
            throw new BusinessException("只能取消可预约的排课");
        }

        schedule.setStatus(2);
        this.updateById(schedule);

        bookingMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<GroupClassBooking>()
                .eq(GroupClassBooking::getScheduleId, id)
                .eq(GroupClassBooking::getStatus, 1)
                .set(GroupClassBooking::getStatus, 2));
    }

    @Transactional(rollbackFor = Exception.class)
    public void bookClass(Long scheduleId, Long userId) {
        GroupClassSchedule schedule = this.getById(scheduleId);
        if (schedule == null) {
            throw new BusinessException("排课不存在");
        }
        if (schedule.getStatus() != 1) {
            throw new BusinessException("该课程已取消");
        }
        if (schedule.getCurrentParticipants() >= schedule.getMaxParticipants()) {
            throw new BusinessException("该课程人数已满");
        }
        if (schedule.getClassDate().isBefore(LocalDate.now())) {
            throw new BusinessException("不能预约已过期的课程");
        }

        GroupClassBooking existBooking = bookingMapper.selectOne(new LambdaQueryWrapper<GroupClassBooking>()
                .eq(GroupClassBooking::getUserId, userId)
                .eq(GroupClassBooking::getScheduleId, scheduleId));

        if (existBooking != null) {
            if (existBooking.getStatus() == 1) {
                throw new BusinessException("您已预约过该课程");
            }
            existBooking.setStatus(1);
            existBooking.setBookingTime(LocalDateTime.now());
            bookingMapper.updateById(existBooking);
        } else {
            boolean hasValidCard = membershipCardService.checkAndConsumeTimes(userId);
            if (!hasValidCard) {
                throw new BusinessException("您没有有效的会员卡");
            }

            GroupClassBooking booking = new GroupClassBooking();
            booking.setUserId(userId);
            booking.setScheduleId(scheduleId);
            booking.setStatus(1);
            booking.setBookingTime(LocalDateTime.now());
            bookingMapper.insert(booking);
        }

        schedule.setCurrentParticipants(schedule.getCurrentParticipants() + 1);
        this.updateById(schedule);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelBooking(Long bookingId) {
        GroupClassBooking booking = bookingMapper.selectById(bookingId);
        if (booking == null) {
            throw new BusinessException("预约记录不存在");
        }
        if (booking.getStatus() != 1) {
            throw new BusinessException("只能取消已预约的课程");
        }

        GroupClassSchedule schedule = this.getById(booking.getScheduleId());
        if (schedule != null && schedule.getClassDate().isEqual(LocalDate.now())) {
            throw new BusinessException("上课当天不能取消预约");
        }

        booking.setStatus(2);
        bookingMapper.updateById(booking);

        if (schedule != null && schedule.getCurrentParticipants() > 0) {
            schedule.setCurrentParticipants(schedule.getCurrentParticipants() - 1);
            this.updateById(schedule);
        }
    }

    public List<GroupClassScheduleVO> getMyBookings(Long userId, Integer status) {
        LambdaQueryWrapper<GroupClassBooking> bookingWrapper = new LambdaQueryWrapper<>();
        bookingWrapper.eq(GroupClassBooking::getUserId, userId);
        if (status != null) {
            bookingWrapper.eq(GroupClassBooking::getStatus, status);
        }
        bookingWrapper.orderByDesc(GroupClassBooking::getBookingTime);

        List<GroupClassBooking> bookings = bookingMapper.selectList(bookingWrapper);
        List<Long> scheduleIds = bookings.stream()
                .map(GroupClassBooking::getScheduleId)
                .collect(Collectors.toList());

        if (scheduleIds.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<GroupClassSchedule> schedules = this.listByIds(scheduleIds);
        return schedules.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public void checkIn(Long bookingId) {
        GroupClassBooking booking = bookingMapper.selectById(bookingId);
        if (booking == null) {
            throw new BusinessException("预约记录不存在");
        }
        if (booking.getStatus() != 1) {
            throw new BusinessException("预约状态异常");
        }

        booking.setStatus(3);
        booking.setCheckInTime(LocalDateTime.now());
        bookingMapper.updateById(booking);

        GroupClassSchedule schedule = this.getById(booking.getScheduleId());
        if (schedule != null) {
            coachPerformanceService.addGroupClassPerformance(schedule.getCoachId(), schedule.getClassDate());
        }
    }
}
