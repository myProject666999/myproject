package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.entity.PatientDiagnosis;
import com.tcm.system.repository.PatientDiagnosisRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientDiagnosisService {

    @Autowired
    private PatientDiagnosisRepository diagnosisRepository;

    public List<PatientDiagnosis> listByPatient(Long patientId) {
        LambdaQueryWrapper<PatientDiagnosis> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(PatientDiagnosis::getPatientId, patientId);
        }
        wrapper.orderByDesc(PatientDiagnosis::getVisitDate);
        return diagnosisRepository.selectList(wrapper);
    }

    public PatientDiagnosis getById(Long id) {
        return diagnosisRepository.selectById(id);
    }

    public boolean save(PatientDiagnosis diagnosis) {
        return diagnosisRepository.insert(diagnosis) > 0;
    }

    public boolean update(PatientDiagnosis diagnosis) {
        return diagnosisRepository.updateById(diagnosis) > 0;
    }

    public boolean delete(Long id) {
        return diagnosisRepository.deleteById(id) > 0;
    }
}
