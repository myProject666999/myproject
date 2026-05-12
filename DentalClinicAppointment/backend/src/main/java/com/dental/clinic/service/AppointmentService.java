package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.Appointment;
import com.dental.clinic.entity.Schedule;
import com.dental.clinic.mapper.AppointmentMapper;
import com.dental.clinic.mapper.ScheduleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentMapper appointmentMapper;

    @Autowired
    private ScheduleMapper scheduleMapper;

    public Page<Appointment> page(Long current, Long size, Long patientId, Long doctorId, Long clinicId, String status) {
        Page<Appointment> page = new Page<>(current, size);
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(Appointment::getPatientId, patientId);
        }
        if (doctorId != null) {
            wrapper.eq(Appointment::getDoctorId, doctorId);
        }
        if (clinicId != null) {
            wrapper.eq(Appointment::getClinicId, clinicId);
        }
        if (status != null) {
            wrapper.eq(Appointment::getStatus, status);
        }
        wrapper.orderByDesc(Appointment::getAppointmentDate, Appointment::getAppointmentTime);
        return appointmentMapper.selectPage(page, wrapper);
    }

    public Appointment getById(Long id) {
        return appointmentMapper.selectById(id);
    }

    @Transactional
    public boolean save(Appointment appointment) {
        Schedule schedule = scheduleMapper.selectById(appointment.getScheduleId());
        if (schedule == null) {
            throw new RuntimeException("排班不存在");
        }
        if (schedule.getBookedSlots() >= schedule.getTotalSlots()) {
            throw new RuntimeException("该时段已满");
        }
        
        appointment.setAppointmentNo("APT" + System.currentTimeMillis());
        appointment.setCreateTime(LocalDateTime.now());
        appointment.setUpdateTime(LocalDateTime.now());
        appointment.setStatus("PENDING");
        
        int result = appointmentMapper.insert(appointment);
        if (result > 0) {
            schedule.setBookedSlots(schedule.getBookedSlots() + 1);
            schedule.setUpdateTime(LocalDateTime.now());
            scheduleMapper.updateById(schedule);
        }
        return result > 0;
    }

    public boolean update(Appointment appointment) {
        appointment.setUpdateTime(LocalDateTime.now());
        return appointmentMapper.updateById(appointment) > 0;
    }

    @Transactional
    public boolean cancel(Long id) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null) return false;
        
        appointment.setStatus("CANCELLED");
        appointment.setUpdateTime(LocalDateTime.now());
        int result = appointmentMapper.updateById(appointment);
        
        if (result > 0 && appointment.getScheduleId() != null) {
            Schedule schedule = scheduleMapper.selectById(appointment.getScheduleId());
            if (schedule != null) {
                schedule.setBookedSlots(Math.max(0, schedule.getBookedSlots() - 1));
                schedule.setUpdateTime(LocalDateTime.now());
                scheduleMapper.updateById(schedule);
            }
        }
        return result > 0;
    }

    public List<Appointment> listByPatientId(Long patientId) {
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Appointment::getPatientId, patientId)
               .orderByDesc(Appointment::getAppointmentDate, Appointment::getAppointmentTime);
        return appointmentMapper.selectList(wrapper);
    }
}
