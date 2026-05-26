package com.health.appointment.service;

import com.health.appointment.entity.Department;
import com.health.appointment.entity.Doctor;
import com.health.appointment.entity.Schedule;
import com.health.appointment.repository.DepartmentRepository;
import com.health.appointment.repository.DoctorRepository;
import com.health.appointment.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Schedule> getSchedulesByDepartment(Long departmentId, LocalDate startDate, LocalDate endDate) {
        List<Schedule> schedules;
        if (startDate != null && endDate != null) {
            schedules = scheduleRepository.findByDepartmentIdAndScheduleDateBetween(departmentId, startDate, endDate);
        } else {
            schedules = scheduleRepository.findByDepartmentIdAndStatus(departmentId, 1);
        }
        schedules.forEach(this::loadRelations);
        return schedules;
    }

    public List<Schedule> getSchedulesByDoctor(Long doctorId, LocalDate startDate, LocalDate endDate) {
        List<Schedule> schedules;
        if (startDate != null && endDate != null) {
            schedules = scheduleRepository.findByDoctorIdAndScheduleDateBetween(doctorId, startDate, endDate);
        } else {
            schedules = scheduleRepository.findByDoctorIdAndStatus(doctorId, 1);
        }
        schedules.forEach(this::loadRelations);
        return schedules;
    }

    public Schedule getScheduleById(Long id) {
        Schedule schedule = scheduleRepository.findById(id).orElse(null);
        if (schedule != null) {
            loadRelations(schedule);
        }
        return schedule;
    }

    private void loadRelations(Schedule schedule) {
        if (schedule.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findById(schedule.getDoctorId()).orElse(null);
            schedule.setDoctor(doctor);
        }
        if (schedule.getDepartmentId() != null) {
            Department department = departmentRepository.findById(schedule.getDepartmentId()).orElse(null);
            schedule.setDepartment(department);
        }
    }
}
