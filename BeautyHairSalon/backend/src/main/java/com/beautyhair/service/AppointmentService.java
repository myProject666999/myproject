
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.Appointment;
import com.beautyhair.entity.Employee;
import com.beautyhair.mapper.AppointmentMapper;
import com.beautyhair.mapper.EmployeeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentMapper appointmentMapper;
    private final EmployeeMapper employeeMapper;

    public PageResult<Appointment> getAppointmentPage(int page, int size, String keyword, Integer status,
                                                       LocalDate startDate, LocalDate endDate, Long technicianId) {
        Page<Appointment> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Appointment::getCustomerName, keyword)
                    .or().like(Appointment::getPhone, keyword)
                    .or().like(Appointment::getAppointmentNo, keyword));
        }
        if (status != null) {
            wrapper.eq(Appointment::getStatus, status);
        }
        if (startDate != null) {
            wrapper.ge(Appointment::getAppointmentDate, startDate);
        }
        if (endDate != null) {
            wrapper.le(Appointment::getAppointmentDate, endDate);
        }
        if (technicianId != null) {
            wrapper.eq(Appointment::getTechnicianId, technicianId);
        }
        wrapper.orderByDesc(Appointment::getAppointmentDate)
                .orderByDesc(Appointment::getAppointmentTime);

        IPage<Appointment> result = appointmentMapper.selectPage(pageParam, wrapper);

        List<Appointment> records = result.getRecords();
        for (Appointment record : records) {
            if (record.getTechnicianId() != null) {
                Employee technician = employeeMapper.selectById(record.getTechnicianId());
                if (technician != null) {
                    record.setTechnicianName(technician.getEmployeeName());
                }
            }
        }

        return new PageResult<>(records, result.getTotal());
    }

    public Appointment getById(Long id) {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment != null && appointment.getTechnicianId() != null) {
            Employee technician = employeeMapper.selectById(appointment.getTechnicianId());
            if (technician != null) {
                appointment.setTechnicianName(technician.getEmployeeName());
            }
        }
        return appointment;
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Appointment appointment) {
        if (StrUtil.isBlank(appointment.getAppointmentNo())) {
            appointment.setAppointmentNo("APT" + System.currentTimeMillis());
        }
        if (appointment.getStatus() == null) {
            appointment.setStatus(1);
        }
        if (appointment.getSource() == null) {
            appointment.setSource("线下");
        }
        appointmentMapper.insert(appointment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Appointment appointment) {
        appointmentMapper.updateById(appointment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setStatus(status);
        appointmentMapper.updateById(appointment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        appointmentMapper.deleteById(id);
    }

    public List<Map<String, Object>> getAppointmentSchedule(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<Appointment> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(Appointment::getAppointmentDate, startDate, endDate);
        wrapper.orderByAsc(Appointment::getAppointmentDate)
                .orderByAsc(Appointment::getAppointmentTime);

        List<Appointment> list = appointmentMapper.selectList(wrapper);

        for (Appointment item : list) {
            if (item.getTechnicianId() != null) {
                Employee technician = employeeMapper.selectById(item.getTechnicianId());
                if (technician != null) {
                    item.setTechnicianName(technician.getEmployeeName());
                }
            }
        }

        return list.stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("title", (item.getCustomerName() != null ? item.getCustomerName() : "预约") + 
                    (item.getServiceName() != null ? " - " + item.getServiceName() : ""));
            map.put("date", item.getAppointmentDate());
            map.put("time", item.getAppointmentTime());
            map.put("technicianId", item.getTechnicianId());
            map.put("technicianName", item.getTechnicianName());
            map.put("status", item.getStatus());
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }

    public List<Employee> getTechnicians() {
        return employeeMapper.selectList(
                new LambdaQueryWrapper<Employee>()
                        .eq(Employee::getIsTechnician, 1)
                        .eq(Employee::getStatus, 1)
        );
    }

    public Map<String, Object> getAppointmentStatistics() {
        Map<String, Object> stats = new HashMap<>();

        LocalDate today = LocalDate.now();
        Long todayCount = appointmentMapper.countByDate(today);
        Long completedCount = appointmentMapper.countCompletedByDate(today);
        Long pendingCount = appointmentMapper.selectCount(
                new LambdaQueryWrapper<Appointment>()
                        .eq(Appointment::getAppointmentDate, today)
                        .lt(Appointment::getStatus, 4)
        );

        stats.put("todayCount", todayCount);
        stats.put("completedCount", completedCount);
        stats.put("pendingCount", pendingCount);

        return stats;
    }
}
