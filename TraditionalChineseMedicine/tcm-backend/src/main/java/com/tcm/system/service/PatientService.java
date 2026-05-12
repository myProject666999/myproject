package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.entity.Patient;
import com.tcm.system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public List<Patient> list(String keyword) {
        LambdaQueryWrapper<Patient> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Patient::getName, keyword)
                    .or().like(Patient::getPhone, keyword);
        }
        wrapper.orderByDesc(Patient::getCreateTime);
        return patientRepository.selectList(wrapper);
    }

    public Patient getById(Long id) {
        return patientRepository.selectById(id);
    }

    public boolean save(Patient patient) {
        return patientRepository.insert(patient) > 0;
    }

    public boolean update(Patient patient) {
        return patientRepository.updateById(patient) > 0;
    }

    public boolean delete(Long id) {
        return patientRepository.deleteById(id) > 0;
    }
}
