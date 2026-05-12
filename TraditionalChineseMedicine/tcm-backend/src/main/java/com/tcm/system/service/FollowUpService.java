package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.entity.FollowUp;
import com.tcm.system.repository.FollowUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FollowUpService {

    @Autowired
    private FollowUpRepository followUpRepository;

    public List<FollowUp> listByPatient(Long patientId) {
        LambdaQueryWrapper<FollowUp> wrapper = new LambdaQueryWrapper<>();
        if (patientId != null) {
            wrapper.eq(FollowUp::getPatientId, patientId);
        }
        wrapper.orderByDesc(FollowUp::getVisitDate);
        return followUpRepository.selectList(wrapper);
    }

    public FollowUp getById(Long id) {
        return followUpRepository.selectById(id);
    }

    public boolean save(FollowUp followUp) {
        return followUpRepository.insert(followUp) > 0;
    }

    public boolean update(FollowUp followUp) {
        return followUpRepository.updateById(followUp) > 0;
    }

    public boolean delete(Long id) {
        return followUpRepository.deleteById(id) > 0;
    }
}
