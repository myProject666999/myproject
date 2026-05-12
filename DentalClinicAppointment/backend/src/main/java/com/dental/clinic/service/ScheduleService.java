package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.Schedule;
import com.dental.clinic.mapper.ScheduleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleMapper scheduleMapper;

    public Page<Schedule> page(Long current, Long size, Long doctorId, Long clinicId, LocalDate startDate, LocalDate endDate) {
        Page<Schedule> page = new Page<>(current, size);
        LambdaQueryWrapper<Schedule> wrapper = new LambdaQueryWrapper<>();
        if (doctorId != null) {
            wrapper.eq(Schedule::getDoctorId, doctorId);
        }
        if (clinicId != null) {
            wrapper.eq(Schedule::getClinicId, clinicId);
        }
        if (startDate != null) {
            wrapper.ge(Schedule::getScheduleDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(Schedule::getScheduleDate, endDate);
        }
        wrapper.orderByAsc(Schedule::getScheduleDate, Schedule::getStartTime);
        return scheduleMapper.selectPage(page, wrapper);
    }

    public List<Schedule> listByDoctorAndDate(Long doctorId, LocalDate date) {
        LambdaQueryWrapper<Schedule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Schedule::getDoctorId, doctorId)
               .eq(Schedule::getScheduleDate, date)
               .eq(Schedule::getStatus, 1);
        return scheduleMapper.selectList(wrapper);
    }

    public Schedule getById(Long id) {
        return scheduleMapper.selectById(id);
    }

    public boolean save(Schedule schedule) {
        schedule.setCreateTime(LocalDateTime.now());
        schedule.setUpdateTime(LocalDateTime.now());
        if (schedule.getStatus() == null) {
            schedule.setStatus(1);
        }
        if (schedule.getBookedSlots() == null) {
            schedule.setBookedSlots(0);
        }
        return scheduleMapper.insert(schedule) > 0;
    }

    public boolean update(Schedule schedule) {
        schedule.setUpdateTime(LocalDateTime.now());
        return scheduleMapper.updateById(schedule) > 0;
    }

    public boolean delete(Long id) {
        return scheduleMapper.deleteById(id) > 0;
    }

    public boolean updateBookedSlots(Long scheduleId, int delta) {
        Schedule schedule = scheduleMapper.selectById(scheduleId);
        if (schedule == null) return false;
        int newBooked = schedule.getBookedSlots() + delta;
        if (newBooked < 0 || newBooked > schedule.getTotalSlots()) return false;
        schedule.setBookedSlots(newBooked);
        schedule.setUpdateTime(LocalDateTime.now());
        return scheduleMapper.updateById(schedule) > 0;
    }
}
