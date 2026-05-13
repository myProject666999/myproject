package com.court.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.court.reservation.common.Result;
import com.court.reservation.entity.Coach;
import com.court.reservation.entity.CoachCourse;
import com.court.reservation.mapper.CoachCourseMapper;
import com.court.reservation.mapper.CoachMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/coach")
public class CoachController {

    @Resource
    private CoachMapper coachMapper;

    @Resource
    private CoachCourseMapper coachCourseMapper;

    @GetMapping("/list")
    public Result<List<Coach>> list(@RequestParam(required = false) String sportType) {
        QueryWrapper<Coach> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1);
        if (sportType != null && !sportType.isEmpty()) {
            wrapper.eq("sport_type", sportType);
        }
        wrapper.orderByDesc("create_time");
        return Result.success(coachMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Coach> getById(@PathVariable Long id) {
        return Result.success(coachMapper.selectById(id));
    }

    @PostMapping
    public Result<Coach> create(@RequestBody Coach coach) {
        coach.setStatus(1);
        coach.setCreateTime(LocalDateTime.now());
        coach.setUpdateTime(LocalDateTime.now());
        coachMapper.insert(coach);
        return Result.success(coach);
    }

    @PutMapping("/{id}")
    public Result<Coach> update(@PathVariable Long id, @RequestBody Coach coach) {
        coach.setId(id);
        coach.setUpdateTime(LocalDateTime.now());
        coachMapper.updateById(coach);
        return Result.success(coach);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        coachMapper.deleteById(id);
        return Result.success();
    }

    @GetMapping("/course/list")
    public Result<List<CoachCourse>> courseList(
            @RequestParam(required = false) Long coachId,
            @RequestParam(required = false) Long userId) {
        QueryWrapper<CoachCourse> wrapper = new QueryWrapper<>();
        if (coachId != null) {
            wrapper.eq("coach_id", coachId);
        }
        if (userId != null) {
            wrapper.eq("user_id", userId);
        }
        wrapper.orderByDesc("create_time");
        return Result.success(coachCourseMapper.selectList(wrapper));
    }

    @PostMapping("/course")
    @Transactional
    public Result<CoachCourse> createCourse(@RequestBody CoachCourse course) {
        Coach coach = coachMapper.selectById(course.getCoachId());
        if (coach == null) {
            throw new RuntimeException("教练不存在");
        }

        QueryWrapper<CoachCourse> checkWrapper = new QueryWrapper<>();
        checkWrapper.eq("coach_id", course.getCoachId())
                .eq("date", course.getDate())
                .eq("time_slot", course.getTimeSlot())
                .in("status", Arrays.asList(0, 1));
        if (coachCourseMapper.selectCount(checkWrapper) > 0) {
            throw new RuntimeException("该时段已有课程安排");
        }

        course.setPrice(coach.getPricePerHour());
        course.setStatus(0);
        course.setCreateTime(LocalDateTime.now());
        course.setUpdateTime(LocalDateTime.now());
        coachCourseMapper.insert(course);
        return Result.success(course);
    }

    @PutMapping("/course/{id}/confirm")
    public Result<CoachCourse> confirmCourse(@PathVariable Long id) {
        CoachCourse course = coachCourseMapper.selectById(id);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }
        if (course.getStatus() != 0) {
            throw new RuntimeException("课程状态不允许确认");
        }
        course.setStatus(1);
        course.setUpdateTime(LocalDateTime.now());
        coachCourseMapper.updateById(course);
        return Result.success(course);
    }

    @PutMapping("/course/{id}/complete")
    public Result<CoachCourse> completeCourse(@PathVariable Long id) {
        CoachCourse course = coachCourseMapper.selectById(id);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }
        if (course.getStatus() != 1) {
            throw new RuntimeException("课程状态不允许完成");
        }
        course.setStatus(2);
        course.setUpdateTime(LocalDateTime.now());
        coachCourseMapper.updateById(course);
        return Result.success(course);
    }

    @PutMapping("/course/{id}/cancel")
    public Result<CoachCourse> cancelCourse(@PathVariable Long id) {
        CoachCourse course = coachCourseMapper.selectById(id);
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }
        if (course.getStatus() == 2) {
            throw new RuntimeException("已完成的课程不能取消");
        }
        course.setStatus(3);
        course.setUpdateTime(LocalDateTime.now());
        coachCourseMapper.updateById(course);
        return Result.success(course);
    }
}