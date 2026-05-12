package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.dental.clinic.entity.Doctor;
import com.dental.clinic.mapper.DoctorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorMapper doctorMapper;

    public List<Doctor> list(Long clinicId) {
        LambdaQueryWrapper<Doctor> wrapper = new LambdaQueryWrapper<>();
        if (clinicId != null) {
            wrapper.eq(Doctor::getClinicId, clinicId);
        }
        wrapper.eq(Doctor::getStatus, 1)
               .orderByAsc(Doctor::getSortOrder);
        return doctorMapper.selectList(wrapper);
    }

    public Doctor getById(Long id) {
        return doctorMapper.selectById(id);
    }

    public boolean save(Doctor doctor) {
        doctor.setCreateTime(LocalDateTime.now());
        doctor.setUpdateTime(LocalDateTime.now());
        if (doctor.getStatus() == null) {
            doctor.setStatus(1);
        }
        if (doctor.getSortOrder() == null) {
            doctor.setSortOrder(0);
        }
        return doctorMapper.insert(doctor) > 0;
    }

    public boolean update(Doctor doctor) {
        doctor.setUpdateTime(LocalDateTime.now());
        return doctorMapper.updateById(doctor) > 0;
    }

    public boolean delete(Long id) {
        return doctorMapper.deleteById(id) > 0;
    }
}
