package com.gym.membership.controller;

import com.gym.membership.common.PageResult;
import com.gym.membership.common.Result;
import com.gym.membership.dto.GroupClassScheduleDTO;
import com.gym.membership.entity.CourseType;
import com.gym.membership.service.GroupClassService;
import com.gym.membership.vo.GroupClassScheduleVO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/group-classes")
public class GroupClassController {

    private final GroupClassService groupClassService;

    public GroupClassController(GroupClassService groupClassService) {
        this.groupClassService = groupClassService;
    }

    @GetMapping("/types")
    public Result<List<CourseType>> getCourseTypeList() {
        List<CourseType> types = groupClassService.getCourseTypeList();
        return Result.success(types);
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<Void> createSchedule(@Validated @RequestBody GroupClassScheduleDTO dto) {
        groupClassService.createSchedule(dto);
        return Result.success("排课成功", null);
    }

    @GetMapping("/schedules")
    public Result<PageResult<GroupClassScheduleVO>> getSchedulePage(
            @RequestParam(defaultValue = "1") Long pageNum,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long courseTypeId,
            @RequestParam(required = false) Long coachId,
            @RequestParam(required = false) Integer status) {
        PageResult<GroupClassScheduleVO> result = groupClassService.getSchedulePage(
                pageNum, pageSize, startDate, endDate, courseTypeId, coachId, status);
        return Result.success(result);
    }

    @GetMapping("/schedules/{id}")
    public Result<GroupClassScheduleVO> getScheduleById(@PathVariable Long id) {
        GroupClassScheduleVO vo = groupClassService.getScheduleById(id);
        return Result.success(vo);
    }

    @PutMapping("/schedules/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<Void> cancelSchedule(@PathVariable Long id) {
        groupClassService.cancelSchedule(id);
        return Result.success("取消成功", null);
    }

    @PostMapping("/schedules/{id}/book")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('MEMBER')")
    public Result<Void> bookClass(@PathVariable Long id, @RequestParam Long userId) {
        groupClassService.bookClass(id, userId);
        return Result.success("预约成功", null);
    }

    @PostMapping("/bookings/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('MEMBER')")
    public Result<Void> cancelBooking(@PathVariable Long id) {
        groupClassService.cancelBooking(id);
        return Result.success("取消成功", null);
    }

    @GetMapping("/bookings/my")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('MEMBER')")
    public Result<List<GroupClassScheduleVO>> getMyBookings(
            @RequestParam Long userId,
            @RequestParam(required = false) Integer status) {
        List<GroupClassScheduleVO> bookings = groupClassService.getMyBookings(userId, status);
        return Result.success(bookings);
    }

    @PostMapping("/bookings/{id}/check-in")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<Void> checkIn(@PathVariable Long id) {
        groupClassService.checkIn(id);
        return Result.success("签到成功", null);
    }
}
