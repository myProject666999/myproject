package com.gym.membership.controller;

import com.gym.membership.common.PageResult;
import com.gym.membership.common.Result;
import com.gym.membership.dto.PrivateCourseDTO;
import com.gym.membership.dto.PrivateScheduleDTO;
import com.gym.membership.entity.PrivateCourse;
import com.gym.membership.entity.PrivateSchedule;
import com.gym.membership.service.PrivateCourseService;
import com.gym.membership.vo.PrivateScheduleVO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/private-courses")
public class PrivateCourseController {

    private final PrivateCourseService privateCourseService;

    public PrivateCourseController(PrivateCourseService privateCourseService) {
        this.privateCourseService = privateCourseService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<PrivateCourse> createCourse(@Validated @RequestBody PrivateCourseDTO dto) {
        PrivateCourse course = privateCourseService.createCourse(dto);
        return Result.success("创建成功", course);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('COACH')")
    public Result<PageResult<PrivateCourse>> getCoursePage(
            @RequestParam(defaultValue = "1") Long pageNum,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long coachId,
            @RequestParam(required = false) Integer status) {
        PageResult<PrivateCourse> result = privateCourseService.getCoursePage(pageNum, pageSize, userId, coachId, status);
        return Result.success(result);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('COACH')")
    public Result<List<PrivateCourse>> getCoursesByUserId(@PathVariable Long userId) {
        List<PrivateCourse> courses = privateCourseService.getCoursesByUserId(userId);
        return Result.success(courses);
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('COACH')")
    public Result<PrivateSchedule> createSchedule(@Validated @RequestBody PrivateScheduleDTO dto) {
        PrivateSchedule schedule = privateCourseService.createSchedule(dto);
        return Result.success("排课成功", schedule);
    }

    @GetMapping("/schedules")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('COACH')")
    public Result<PageResult<PrivateScheduleVO>> getSchedulePage(
            @RequestParam(defaultValue = "1") Long pageNum,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long coachId,
            @RequestParam(required = false) Integer status) {
        PageResult<PrivateScheduleVO> result = privateCourseService.getSchedulePage(
                pageNum, pageSize, startDate, endDate, userId, coachId, status);
        return Result.success(result);
    }

    @GetMapping("/schedules/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('COACH')")
    public Result<PrivateScheduleVO> getScheduleById(@PathVariable Long id) {
        PrivateScheduleVO vo = privateCourseService.getScheduleById(id);
        return Result.success(vo);
    }

    @PutMapping("/schedules/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION') or hasRole('COACH')")
    public Result<Void> cancelSchedule(@PathVariable Long id) {
        privateCourseService.cancelSchedule(id);
        return Result.success("取消成功", null);
    }

    @PostMapping("/schedules/{id}/check-in")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<Void> checkIn(@PathVariable Long id) {
        privateCourseService.checkIn(id);
        return Result.success("签到成功，课时已核销", null);
    }
}
