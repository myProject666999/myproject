package com.dental.clinic.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.entity.Patient;
import com.dental.clinic.mapper.PatientMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class PatientService {

    @Autowired
    private PatientMapper patientMapper;

    public Page<Patient> page(Long current, Long size, String name, String phone, Long clinicId) {
        Page<Patient> page = new Page<>(current, size);
        LambdaQueryWrapper<Patient> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(name)) {
            wrapper.like(Patient::getName, name);
        }
        if (StringUtils.hasText(phone)) {
            wrapper.like(Patient::getPhone, phone);
        }
        if (clinicId != null) {
            wrapper.eq(Patient::getClinicId, clinicId);
        }
        wrapper.orderByDesc(Patient::getCreateTime);
        return patientMapper.selectPage(page, wrapper);
    }

    public Patient getById(Long id) {
        return patientMapper.selectById(id);
    }

    public boolean save(Patient patient) {
        patient.setCreateTime(LocalDateTime.now());
        patient.setUpdateTime(LocalDateTime.now());
        return patientMapper.insert(patient) > 0;
    }

    public boolean update(Patient patient) {
        patient.setUpdateTime(LocalDateTime.now());
        return patientMapper.updateById(patient) > 0;
    }

    public boolean delete(Long id) {
        return patientMapper.deleteById(id) > 0;
    }
}
